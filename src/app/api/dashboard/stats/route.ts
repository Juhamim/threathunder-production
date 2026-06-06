import { auth } from "@/auth";
import { db } from "@/db";
import { uploads, threats, securityScores, reports, logs } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";

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
    // 1. Purge any pre-existing sandbox demo data for this user
    try {
      await db
        .delete(uploads)
        .where(
          and(
            eq(uploads.userId, userId),
            eq(uploads.filename, "sandbox_telemetry_honeypot.log")
          )
        );
    } catch (cleanErr) {
      console.warn("Failed to clean up sandbox telemetry:", cleanErr);
    }

    // 2. Get all uploads for user
    let userUploads: any[] = [];
    let isDbOffline = false;
    try {
      userUploads = await db
        .select()
        .from(uploads)
        .where(eq(uploads.userId, userId))
        .orderBy(desc(uploads.createdAt));
    } catch (dbErr) {
      console.warn("Database connection offline:", dbErr);
      isDbOffline = true;
    }

    // 3. Compute stats
    let totalLogsScanned = 0;
    userUploads.forEach((u) => {
      totalLogsScanned += u.totalLines || 0;
    });

    let userThreats: any[] = [];
    if (!isDbOffline) {
      try {
        userThreats = await db
          .select()
          .from(threats)
          .where(eq(threats.userId, userId))
          .orderBy(desc(threats.createdAt));
      } catch (threatsErr) {
        console.warn("Failed to fetch threats:", threatsErr);
      }
    }
    const totalThreats = userThreats.length;

    const criticalAlerts = userThreats.filter((t) => t.severity === "critical").length;
    const highAlerts = userThreats.filter((t) => t.severity === "high").length;
    const mediumAlerts = userThreats.filter((t) => t.severity === "medium").length;
    const lowAlerts = userThreats.filter((t) => t.severity === "low").length;

    // Get latest security score
    let riskScore = 100;
    if (!isDbOffline && userUploads.length > 0) {
      try {
        const latestScoreRecord = await db
          .select()
          .from(securityScores)
          .where(eq(securityScores.userId, userId))
          .orderBy(desc(securityScores.createdAt))
          .limit(1);
        riskScore = latestScoreRecord.length > 0 ? latestScoreRecord[0].score : 100;
      } catch (scoreErr) {
        console.warn("Failed to fetch security score:", scoreErr);
      }
    }

    // 4. Get recent threats list (up to 5)
    const recentThreatsList = userThreats.slice(0, 5).map((t) => ({
      id: t.id,
      type: t.title,
      ip: t.affectedIps?.[0] || "unknown",
      severity: t.severity,
      time: formatRelativeTime(t.createdAt),
      file: "system.log",
    }));

    // Map filenames
    const uploadMap = new Map(userUploads.map((u) => [u.id, u.filename]));
    userThreats.forEach((t, i) => {
      if (i < 5 && recentThreatsList[i]) {
        recentThreatsList[i].file = uploadMap.get(t.uploadId) || "system.log";
      }
    });

    // 5. Group threats by categories for PieChart
    const categoryCounts: Record<string, number> = {};
    userThreats.forEach((t) => {
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

    // 6. Build Threat Trends
    const trendMap: Record<string, { date: string; critical: number; high: number; medium: number; low: number }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap[dateStr] = { date: dateStr, critical: 0, high: 0, medium: 0, low: 0 };
    }

    userThreats.forEach((t) => {
      const dateStr = new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (trendMap[dateStr]) {
        if (t.severity === "critical") trendMap[dateStr].critical++;
        else if (t.severity === "high") trendMap[dateStr].high++;
        else if (t.severity === "medium") trendMap[dateStr].medium++;
        else if (t.severity === "low") trendMap[dateStr].low++;
      }
    });

    const threatTrendData = Object.values(trendMap);

    // 7. Log volume distribution over hours
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
        highAlerts,
        mediumAlerts,
        lowAlerts,
        riskScore,
        threatTrendData,
        attackCategories,
        logVolumeData,
        recentThreats: recentThreatsList,
      },
    });
  } catch (error) {
    console.error("Dashboard stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}

// ─── POST: Seed Sandbox Data (Disabled) ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Method not allowed. Sandbox seeding disabled." }, { status: 405 });
}
