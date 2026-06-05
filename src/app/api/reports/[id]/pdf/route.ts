import React from "react";
import { auth } from "@/auth";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

export const dynamic = "force-dynamic";

// Stylesheet for @react-pdf/renderer
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333333",
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottom: "2px solid #00d9ff",
    paddingBottom: 15,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
  headerSubtitle: {
    fontSize: 8,
    color: "#666666",
    marginTop: 4,
    textTransform: "uppercase",
  },
  riskScoreBox: {
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  riskScoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  riskScoreLabel: {
    fontSize: 7,
    color: "#666666",
    marginTop: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0284c7",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  bodyText: {
    lineHeight: 1.5,
    marginBottom: 5,
  },
  actionRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  actionNumber: {
    width: 15,
    fontWeight: "bold",
    color: "#0284c7",
  },
  actionText: {
    flex: 1,
    lineHeight: 1.4,
  },
  iocBadge: {
    backgroundColor: "#f4f4f5",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 8,
    fontFamily: "Courier",
  },
  iocList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  timelineRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
    paddingVertical: 6,
  },
  timelineTime: {
    width: 80,
    fontWeight: "bold",
    color: "#666666",
  },
  timelineEvent: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#999999",
  },
});

// React PDF Document structure built using React.createElement to avoid JSX inside route.ts
const IncidentReportDocument = ({ report }: { report: any }) => {
  const actions = Array.isArray(report.recommendedActions)
    ? report.recommendedActions
    : typeof report.recommendedActions === "string"
    ? JSON.parse(report.recommendedActions)
    : [];

  const iocs = Array.isArray(report.iocs)
    ? report.iocs
    : typeof report.iocs === "string"
    ? JSON.parse(report.iocs)
    : [];

  const timeline = Array.isArray(report.timeline)
    ? report.timeline
    : typeof report.timeline === "string"
    ? JSON.parse(report.timeline)
    : [];

  const getScoreColor = (score: number) => {
    if (score <= 25) return "#ef4444";
    if (score <= 50) return "#f97316";
    if (score <= 70) return "#eab308";
    return "#10b981";
  };

  const riskColor = getScoreColor(report.riskScore || 50);

  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.headerTitle }, "ThreatHunter AI"),
          React.createElement(Text, { style: styles.headerSubtitle }, "Security Incident Report")
        ),
        React.createElement(View, { style: [styles.riskScoreBox, { borderColor: riskColor, backgroundColor: riskColor + "10" }] },
          React.createElement(Text, { style: [styles.riskScoreText, { color: riskColor }] }, report.riskScore || 50),
          React.createElement(Text, { style: styles.riskScoreLabel }, "RISK SCORE")
        )
      ),

      // Title
      React.createElement(View, { style: { marginBottom: 20 } },
        React.createElement(Text, { style: { fontSize: 13, fontWeight: "bold", color: "#111827" } }, report.title),
        React.createElement(Text, { style: { fontSize: 8, color: "#6b7280", marginTop: 4 } }, `Report Generated: ${new Date(report.createdAt).toUTCString()}`)
      ),

      // Executive Summary
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Executive Summary"),
        React.createElement(Text, { style: styles.bodyText }, report.executiveSummary || "No executive summary available.")
      ),

      // Threat Overview
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Threat Overview"),
        React.createElement(Text, { style: styles.bodyText }, report.threatOverview || "No detailed threat overview available.")
      ),

      // Recommended Actions
      actions.length > 0 ? React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Recommended Remediation Actions"),
        actions.map((act: string, idx: number) =>
          React.createElement(View, { key: idx, style: styles.actionRow },
            React.createElement(Text, { style: styles.actionNumber }, `${idx + 1}.`),
            React.createElement(Text, { style: styles.actionText }, act)
          )
        )
      ) : null,

      // IoCs
      iocs.length > 0 ? React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Indicators of Compromise (IoCs)"),
        React.createElement(View, { style: styles.iocList },
          iocs.map((ioc: string, idx: number) =>
            React.createElement(Text, { key: idx, style: styles.iocBadge }, ioc)
          )
        )
      ) : null,

      // Timeline
      timeline.length > 0 ? React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Attack Timeline Sequence"),
        timeline.map((event: any, idx: number) =>
          React.createElement(View, { key: idx, style: styles.timelineRow },
            React.createElement(Text, { style: styles.timelineTime }, event.time || "T+0"),
            React.createElement(Text, { style: styles.timelineEvent }, event.event || event)
          )
        )
      ) : null,

      // Conclusion
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Conclusion & Next Steps"),
        React.createElement(Text, { style: styles.bodyText }, report.conclusion || "Final analysis of security telemetry completed.")
      ),

      // Footer
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, "ThreatHunter AI Security Briefing · Confidential Incident Response Report")
      )
    )
  );
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await params;

  try {
    const [report] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, userId)))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Generate the PDF as a buffer on the server
    const pdfBuffer = await pdf(React.createElement(IncidentReportDocument, { report }) as any).toBuffer();

    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ThreatHunter_Incident_Report_${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate report PDF" },
      { status: 500 }
    );
  }
}
