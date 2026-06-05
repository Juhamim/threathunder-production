"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, ChevronRight, Shield, Clock } from "lucide-react";
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
    if (score <= 25) return "#ef4444";
    if (score <= 50) return "#f97316";
    if (score <= 70) return "#eab308";
    return "#10b981";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Incident Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          AI-generated incident reports from your log analyses.
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-4 w-2/3 mb-3" />
              <div className="skeleton h-3 w-1/2 mb-2" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <motion.div className="glass-card p-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <FileText size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No Reports Yet</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Upload and analyze security logs to generate your first AI-powered incident report.
          </p>
          <Link href="/logs" className="btn-primary inline-flex items-center gap-2">
            <AlertTriangle size={14} />
            Analyze Logs
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => (
            <motion.div key={report.id} className="glass-card p-5 flex items-center justify-between gap-4"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ x: 2 }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <FileText size={18} style={{ color: "#60a5fa" }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{report.title}</h3>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>{report.executiveSummary}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Clock size={10} />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-mono font-bold" style={{ color: getRiskColor(report.riskScore) }}>
                      Risk: {report.riskScore}/100
                    </div>
                  </div>
                </div>
              </div>
              <Link href={`/reports/${report.id}`}
                className="btn-ghost text-xs flex items-center gap-1 px-3 py-2 flex-shrink-0">
                View <ChevronRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
