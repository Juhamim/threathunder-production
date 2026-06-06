"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { use } from "react";
import {
  Shield, AlertTriangle, Clock, Download, FileText,
  CheckCircle, Target, Activity, ArrowLeft, Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ReportData {
  id: string;
  uploadId: string;
  title: string;
  riskScore: number;
  executiveSummary: string;
  threatOverview: string;
  riskAssessment: string;
  recommendedActions: string[];
  conclusion: string;
  iocs: string[];
  timeline: { time: string; event: string }[];
  affectedAssets: string[];
  createdAt: string;
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) throw new Error("Report not found");
        const data = await res.json();
        setReport(data);
      } catch (e) {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  const getRiskColor = (score: number) => {
    if (score <= 25) return "#ef4444";
    if (score <= 50) return "#f97316";
    if (score <= 70) return "#eab308";
    return "#10b981";
  };

  const handleExportPDF = () => {
    toast.success("Initiating PDF incident report download...");
    window.open(`/api/reports/${id}/pdf`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin" style={{ color: "#38bdf8" }} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="glass-card p-16 text-center max-w-lg mx-auto">
        <FileText size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Report Not Found</h2>
        <Link href="/reports" className="btn-ghost inline-flex items-center gap-2 mt-4">
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
      </div>
    );
  }

  const riskColor = getRiskColor(report.riskScore);

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-6 print:space-y-4">
      {/* Nav */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/reports" className="btn-ghost text-sm flex items-center gap-2">
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
        <button onClick={handleExportPDF} className="btn-primary text-sm flex items-center gap-2">
          <Download size={14} />
          Export PDF
        </button>
      </div>

      {/* Report Header */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)" }}>
              <FileText size={16} style={{ color: "#60a5fa" }} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Security Incident Report
            </span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black font-mono" style={{ color: riskColor }}>
              {report.riskScore}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Risk Score / 100</div>
          </div>
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{report.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-xs mt-3 border-t border-cyan-500/5 pt-3" style={{ color: "var(--text-muted)" }}>
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>Generated {new Date(report.createdAt).toLocaleString()}</span>
          </div>
          {report.uploadId && (
            <a
              href={`/api/logs/download?uploadId=${report.uploadId}`}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-mono font-bold"
              title="Download original telemetry log file"
            >
              <Download size={10} />
              <span>DOWNLOAD_ORIGINAL_LOG</span>
            </a>
          )}
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--accent-cyan)" }}>
          <Shield size={14} />
          Executive Summary
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{report.executiveSummary}</p>
      </motion.div>

      {/* Threat Overview */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#f97316" }}>
          <AlertTriangle size={14} />
          Threat Overview
        </h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{report.threatOverview}</p>
      </motion.div>

      {/* Timeline */}
      {report.timeline?.length > 0 && (
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#8b5cf6" }}>
            <Activity size={14} />
            Attack Timeline
          </h2>
          <div className="space-y-3">
            {report.timeline.map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: "#8b5cf6", flexShrink: 0 }} />
                  {i < report.timeline.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "rgba(139,92,246,0.3)" }} />}
                </div>
                <div className="pb-3">
                  <span className="text-xs font-mono font-bold" style={{ color: "#a78bfa" }}>{event.time}</span>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* IoCs */}
      {report.iocs?.length > 0 && (
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#ef4444" }}>
            <Target size={14} />
            Indicators of Compromise (IoCs)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {report.iocs.map((ioc, i) => (
              <div key={i} className="font-mono text-xs px-3 py-2 rounded"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}>
                {ioc}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk Assessment */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#eab308" }}>
          <Shield size={14} />
          Risk Assessment
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{report.riskAssessment}</p>
      </motion.div>

      {/* Recommended Actions */}
      {report.recommendedActions?.length > 0 && (
        <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#10b981" }}>
            <CheckCircle size={14} />
            Recommended Actions
          </h2>
          <div className="space-y-3">
            {report.recommendedActions.map((action, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#4ade80" }}>
                  {i + 1}
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{action}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Conclusion */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          Conclusion
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{report.conclusion}</p>
      </motion.div>

      {/* Footer */}
      <div className="text-center py-4 border-t" style={{ borderColor: "rgba(56,189,248,0.1)", color: "var(--text-muted)" }}>
        <p className="text-xs">Generated by ThreatHunter AI · Powered by Gemini 2.5 Flash</p>
      </div>
    </div>
  );
}
