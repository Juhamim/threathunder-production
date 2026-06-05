import { auth } from "@/auth";
import { db } from "@/db";
import { uploads, threats, securityScores, reports, logs } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatRelativeTime(date: Date): string {
  const diffMs = new Date().getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getSeverityColor(name: string): string {
  if (name.includes("Brute") || name.includes("SQL")) return "#ff3b5c"; // critical
  if (name.includes("Traversal") || name.includes("Escalation")) return "#ff8800"; // high
  if (name.includes("XSS")) return "#ffb800"; // medium
  return "#00ff88"; // low/emerald
}

// ─── GET: Fetch Stats ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Get all uploads for user (wrap in try-catch to handle connection failures gracefully)
    let userUploads;
    try {
      userUploads = await db.select().from(uploads).where(eq(uploads.userId, userId)).orderBy(desc(uploads.createdAt));
    } catch (dbErr) {
      console.warn("Database connection offline:", dbErr);
      return NextResponse.json({ isEmpty: true, isDbOffline: true });
    }

    if (userUploads.length === 0) {
      return NextResponse.json({ isEmpty: true });
    }

    // 2. Compute sums
    let totalLogsScanned = 0;
    userUploads.forEach(u => {
      totalLogsScanned += u.totalLines || 0;
    });

    const userThreats = await db.select().from(threats).where(eq(threats.userId, userId)).orderBy(desc(threats.createdAt));
    const totalThreats = userThreats.length;

    const criticalAlerts = userThreats.filter(t => t.severity === "critical").length;

    // Get latest security score
    const latestScoreRecord = await db.select().from(securityScores).where(eq(securityScores.userId, userId)).orderBy(desc(securityScores.createdAt)).limit(1);
    const riskScore = latestScoreRecord.length > 0 ? latestScoreRecord[0].score : 100;

    // 3. Get recent threats list (up to 5)
    const recentThreatsList = userThreats.slice(0, 5).map(t => ({
      id: t.id,
      type: t.title,
      ip: t.affectedIps?.[0] || "unknown",
      severity: t.severity,
      time: formatRelativeTime(t.createdAt),
      file: "system.log",
    }));

    // Map filenames
    const uploadMap = new Map(userUploads.map(u => [u.id, u.filename]));
    userThreats.forEach((t, i) => {
      if (i < 5 && recentThreatsList[i]) {
        recentThreatsList[i].file = uploadMap.get(t.uploadId) || "system.log";
      }
    });

    // 4. Group threats by categories for PieChart
    const categoryCounts: Record<string, number> = {};
    userThreats.forEach(t => {
      const type = t.title || "Other Pattern";
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    });
    const attackCategories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: Math.round((count / (totalThreats || 1)) * 100),
      color: getSeverityColor(name),
    }));

    if (attackCategories.length === 0) {
      attackCategories.push({ name: "Clean Telemetry", value: 100, color: "#00ff88" });
    }

    // 5. Build Threat Trends (mock a 7-day trend based on actual dates or distributing over dates)
    const trendMap: Record<string, { date: string; critical: number; high: number; medium: number; low: number }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap[dateStr] = { date: dateStr, critical: 0, high: 0, medium: 0, low: 0 };
    }

    userThreats.forEach(t => {
      const dateStr = new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (trendMap[dateStr]) {
        if (t.severity === "critical") trendMap[dateStr].critical++;
        else if (t.severity === "high") trendMap[dateStr].high++;
        else if (t.severity === "medium") trendMap[dateStr].medium++;
        else if (t.severity === "low") trendMap[dateStr].low++;
      }
    });

    const threatTrendData = Object.values(trendMap);

    // 6. Log volume distribution over hours
    const logVolumeData = [
      { hour: "00:00", count: Math.round(totalLogsScanned * 0.1) },
      { hour: "04:00", count: Math.round(totalLogsScanned * 0.05) },
      { hour: "08:00", count: Math.round(totalLogsScanned * 0.2) },
      { hour: "12:00", count: Math.round(totalLogsScanned * 0.3) },
      { hour: "16:00", count: Math.round(totalLogsScanned * 0.15) },
      { hour: "20:00", count: Math.round(totalLogsScanned * 0.12) },
      { hour: "Now", count: Math.round(totalLogsScanned * 0.08) },
    ];

    return NextResponse.json({
      isEmpty: false,
      stats: {
        totalLogsScanned: formatNumber(totalLogsScanned),
        totalThreats,
        criticalAlerts,
        riskScore,
        threatTrendData,
        attackCategories,
        logVolumeData,
        recentThreats: recentThreatsList,
      }
    });

  } catch (error) {
    console.error("Dashboard stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}

// ─── POST: Seed Sandbox Data ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Create a dummy completed upload record
    const [upload] = await db.insert(uploads).values({
      userId,
      filename: "sandbox_telemetry_honeypot.log",
      originalName: "sandbox_telemetry_honeypot.log",
      size: 245080,
      status: "completed",
      logType: "nginx",
      totalLines: 12450,
    }).returning();

    // 2. Insert structured threats
    await db.insert(threats).values([
      {
        uploadId: upload.id,
        userId,
        type: "brute_force",
        severity: "critical",
        title: "Brute Force Attack",
        description: "Multiple SSH failed login attempts detected in rapid succession.",
        affectedIps: ["185.220.101.44"],
        occurrences: 45,
        evidence: ["May 24 10:12:04 server sshd[1245]: Failed password for root from 185.220.101.44"],
      },
      {
        uploadId: upload.id,
        userId,
        type: "sql_injection",
        severity: "critical",
        title: "SQL Injection",
        description: "Malicious SQL query commands injected into web request parameters.",
        affectedIps: ["203.0.113.57"],
        occurrences: 8,
        evidence: ["GET /api/v1/auth/login?user=admin' UNION SELECT NULL, NULL-- HTTP/1.1"],
      },
      {
        uploadId: upload.id,
        userId,
        type: "traversal",
        severity: "high",
        title: "Directory Traversal",
        description: "Attempt to access sensitive system files outside of web root.",
        affectedIps: ["198.51.100.42"],
        occurrences: 14,
        evidence: ["GET /static/../../../../etc/passwd HTTP/1.1"],
      },
      {
        uploadId: upload.id,
        userId,
        type: "xss",
        severity: "medium",
        title: "Cross-Site Scripting (XSS)",
        description: "Malicious script tags detected inside request search parameters.",
        affectedIps: ["192.168.1.104"],
        occurrences: 3,
        evidence: ["GET /search?q=<script>alert('XSS')</script> HTTP/1.1"],
      },
    ]);

    // 3. Insert security score
    await db.insert(securityScores).values({
      uploadId: upload.id,
      userId,
      score: 34,
      criticalCount: 2,
      highCount: 1,
      mediumCount: 1,
      lowCount: 0,
      totalThreats: 4,
    });

    // 4. Insert dynamic Incident Report
    await db.insert(reports).values({
      uploadId: upload.id,
      userId,
      title: "Incident Report — sandbox_telemetry_honeypot.log",
      executiveSummary: "A multi-stage intrusion attempt was identified in sandbox_telemetry_honeypot.log. This included active network scanning, a brute force campaign targeting root credentials, and exploitation attempts for SQL Injection and Directory Traversal. Recommended immediately blocking the offending external IPs.",
      threatOverview: "The attacker from IP 185.220.101.44 executed a dictionary attack on SSH endpoints, followed by secondary exploit scans from 203.0.113.57. System integrity check recommended.",
      riskScore: 34,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sandbox database seeding failed:", error);
    return NextResponse.json({ error: "Failed to seed sandbox database logs" }, { status: 500 });
  }
}
