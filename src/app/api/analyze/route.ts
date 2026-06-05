import { auth } from "@/auth";
import { db } from "@/db";
import { uploads, logs, threats, securityScores, reports } from "@/db/schema";
import { detectLogType, parseLogContent } from "@/lib/parsers";
import { detectThreats, calculateRiskScore } from "@/lib/threat-detection";
import { generateIncidentReport } from "@/lib/ai/gemini";
import { uploadToR2 } from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id as string;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const allowedTypes = ["text/plain", "text/csv", "application/octet-stream", "text/html"];
    const isText = file.type.startsWith("text/") || file.name.endsWith(".log") ||
      file.name.endsWith(".txt") || file.name.endsWith(".csv");

    if (!isText) {
      return NextResponse.json({ error: "Only text/log/csv files are allowed" }, { status: 400 });
    }

    const content = await file.text();

    // Create upload record
    const [upload] = await db.insert(uploads).values({
      userId,
      filename: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      status: "processing",
    }).returning();

    // Upload raw telemetry log to R2
    const r2Key = `${userId}/${upload.id}/${file.name}`;
    const uploadedToR2 = await uploadToR2(r2Key, content, file.type || "text/plain");

    // Detect log type & parse
    const logType = detectLogType(content);
    const parsedEntries = parseLogContent(content, logType);

    // Store log entries (batch insert, limit 5000)
    const entriesToInsert = parsedEntries.slice(0, 5000).map(entry => ({
      uploadId: upload.id,
      lineNumber: entry.lineNumber,
      timestamp: entry.timestamp,
      ip: entry.ip,
      method: entry.method,
      path: entry.path,
      statusCode: entry.statusCode,
      responseSize: entry.responseSize,
      userAgent: entry.userAgent,
      username: entry.username,
      raw: entry.raw.slice(0, 1000), // truncate very long lines
    }));

    if (entriesToInsert.length > 0) {
      await db.insert(logs).values(entriesToInsert);
    }

    // Run threat detection
    const detectedThreats = detectThreats(parsedEntries);
    const riskData = calculateRiskScore(detectedThreats);

    // Store threats
    if (detectedThreats.length > 0) {
      await db.insert(threats).values(
        detectedThreats.map(t => ({
          uploadId: upload.id,
          userId,
          type: t.type,
          severity: t.severity,
          title: t.title,
          description: t.description,
          evidence: t.evidence,
          affectedIps: t.affectedIps,
          occurrences: t.occurrences,
        }))
      );
    }

    // Store security score
    await db.insert(securityScores).values({
      uploadId: upload.id,
      userId,
      score: riskData.score,
      criticalCount: riskData.criticalCount,
      highCount: riskData.highCount,
      mediumCount: riskData.mediumCount,
      lowCount: riskData.lowCount,
      totalThreats: detectedThreats.length,
    });

    // Generate AI report if threats found
    let reportId: string | null = null;
    if (detectedThreats.length > 0) {
      try {
        const reportData = await generateIncidentReport(
          detectedThreats,
          file.name,
          riskData.score,
          logType
        );

        const [report] = await db.insert(reports).values({
          uploadId: upload.id,
          userId,
          title: `Incident Report — ${file.name}`,
          executiveSummary: reportData.executiveSummary,
          threatOverview: reportData.threatOverview,
          affectedAssets: detectedThreats.flatMap(t => t.affectedIps),
          iocs: reportData.iocs,
          timeline: reportData.timeline,
          riskAssessment: reportData.riskAssessment,
          recommendedActions: reportData.recommendedActions,
          conclusion: reportData.conclusion,
          riskScore: riskData.score,
        }).returning();

        reportId = report.id;
      } catch (e) {
        console.error("AI report generation failed:", e);
      }
    }

    // Update upload status
    await db.update(uploads).set({
      status: "completed",
      logType,
      totalLines: parsedEntries.length,
      r2Key: uploadedToR2 ? r2Key : null,
    }).where(eq(uploads.id, upload.id));

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      reportId,
      stats: {
        totalLines: parsedEntries.length,
        logType,
        threatsFound: detectedThreats.length,
        riskScore: riskData.score,
        threats: detectedThreats.map(t => ({
          type: t.type,
          severity: t.severity,
          title: t.title,
          occurrences: t.occurrences,
        })),
      },
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
