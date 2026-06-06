"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  ChevronRight,
  Shield,
  Clock,
  Briefcase,
  Share2,
  FileDown,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  title: string;
  riskScore: number;
  createdAt: string;
  executiveSummary: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const getRiskColor = (score: number) => {
    if (score > 75) return "#ef4444";
    if (score > 45) return "#f97316";
    if (score > 25) return "#eab308";
    return "#10b981";
  };

  const getRiskLabel = (score: number) => {
    if (score > 75) return "Critical";
    if (score > 45) return "High";
    if (score > 25) return "Medium";
    return "Low";
  };

  const totalReports = reports.length;
  const avgRisk = Math.round(reports.reduce((acc, r) => acc + r.riskScore, 0) / (reports.length || 1));
  const criticalReportsCount = reports.filter(r => r.riskScore > 75).length;

  return (
    <div className="workspace-container overflow-y-auto">
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between h-[60px] border-b border-[#1E2229] pb-3 mb-2">
        <div>
          <h1 className="text-xl font-bold font-heading text-white tracking-tight">Incident Reports</h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">Executive threat briefs and SOC audits</p>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-[#60a5fa] animate-pulse" />
          <span className="font-mono text-[10px] text-[#60a5fa] font-bold uppercase tracking-wider">// BRIEFINGS_HUB</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-xl" />
            ))}
          </div>
          <div className="h-64 skeleton rounded-xl" />
        </div>
      ) : reports.length === 0 ? (
        <motion.div className="glass-card p-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <FileText size={48} className="mx-auto mb-4 text-[#3D4452]" />
          <h2 className="text-lg font-semibold mb-2 text-white">No Reports Generated Yet</h2>
          <p className="text-xs text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
            Upload and analyze security logs or run a Git scanner. AI-powered briefings will populate here automatically.
          </p>
          <Link href="/logs" className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-5">
            <AlertTriangle size={14} />
            <span>Analyze Logs</span>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* Executive Overview Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">Reports Generated</p>
                <p className="text-xl font-bold text-white mt-0.5">{totalReports}</p>
              </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,195,0.1)] border border-[rgba(0,229,195,0.2)] flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-[var(--accent-mint)]" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">Average Risk Score</p>
                <p className="text-xl font-bold text-white mt-0.5" style={{ color: getRiskColor(avgRisk) }}>
                  {avgRisk}/100 <span className="text-xs font-normal text-[var(--text-muted)]">({getRiskLabel(avgRisk)})</span>
                </p>
              </div>
            </div>

            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">Critical Anomalies</p>
                <p className="text-xl font-bold text-white mt-0.5">{criticalReportsCount}</p>
              </div>
            </div>
          </div>

          {/* Core Content Layout (List on left, breakdown dials on right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-4">
            {/* Left side list */}
            <div className="space-y-3">
              {reports.map((report, i) => {
                const color = getRiskColor(report.riskScore);
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.01]"
                    style={{ borderLeft: `3px solid ${color}35` }}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/10 border border-blue-500/20">
                        <FileText size={16} className="text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white leading-tight font-mono">{report.title}</h3>
                        <p className="text-xs mt-1 text-[var(--text-muted)] line-clamp-1 leading-relaxed">
                          {report.executiveSummary}
                        </p>
                        <div className="flex items-center gap-3 mt-2 font-mono text-[10px] text-[#6B7280]">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span>·</span>
                          <span style={{ color }}>Risk: {report.riskScore}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/reports/${report.id}`}
                        className="btn-ghost text-xs h-[30px] px-3.5 inline-flex items-center gap-1 rounded-md"
                      >
                        <span>View</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right side Executive Breakdown Dials */}
            <div className="space-y-4">
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-xs font-mono text-[#6B7280] uppercase tracking-[0.08em]">// REPORT INDEX SUMMARY</h3>
                
                <div className="space-y-3.5 text-xs text-[#C8C4BC]">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={12} className="text-blue-400" />
                      Compliance Status
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">AUDITED</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="flex items-center gap-1.5">
                      <TrendingDown size={12} className="text-blue-400" />
                      Remediation Rate
                    </span>
                    <span className="font-bold text-white font-mono">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <Share2 size={12} className="text-blue-400" />
                      Export Formats
                    </span>
                    <span className="font-mono text-[#6B7280]">PDF, JSON, CSV</span>
                  </div>
                </div>

                <div className="border-t border-[#1E2229] pt-4 mt-2">
                  <p className="text-[10px] text-[#6B7280] leading-relaxed font-mono">
                    All reports are signed by AI SOC Auditor node. Use the detail view links to access interactive remediation step builders.
                  </p>
                </div>
              </div>

              {/* Quick downloads widgets */}
              <div className="glass-card p-5">
                <h3 className="text-xs font-mono text-[#6B7280] uppercase tracking-[0.08em] mb-3">// QUICK DOWNLOAD</h3>
                <div className="space-y-2">
                  {reports.slice(0, 2).map(r => (
                    <Link
                      key={r.id}
                      href={`/reports/${r.id}`}
                      className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-[#0D1117]/30 hover:border-blue-500/20 hover:bg-[#1A1F27] text-xs transition-all duration-200"
                    >
                      <span className="font-mono truncate max-w-[150px] text-[#C8C4BC]">{r.title}</span>
                      <FileDown size={14} className="text-blue-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
