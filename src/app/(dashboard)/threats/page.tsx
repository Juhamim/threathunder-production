"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Shield, Upload, Search, Filter,
  ShieldAlert, Calendar, ChevronDown, ChevronUp, Terminal
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Threat {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  evidence: string[] | null;
  affectedIps: string[] | null;
  occurrences: number;
  createdAt: string;
}

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThreats() {
      try {
        const res = await fetch("/api/threats");
        if (!res.ok) throw new Error("Failed to load threats");
        const data = await res.json();
        setThreats(data);
      } catch (err) {
        toast.error("Failed to load threat feed");
      } finally {
        setLoading(false);
      }
    }
    fetchThreats();
  }, []);

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case "critical": return "#ef4444";
      case "high": return "#f97316";
      case "medium": return "#eab308";
      default: return "#38bdf8";
    }
  };

  const filteredThreats = threats.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.affectedIps && t.affectedIps.some(ip => ip.includes(search)));
    const matchesSeverity = severityFilter === "all" || t.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const toggleExpand = (id: string) => {
    setExpandedThreat(expandedThreat === id ? null : id);
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-heading text-white">Threat Intelligence</h1>
        <p className="text-sm mt-1 text-gray-400">
          Real-time signature analysis and behavior anomalies detected in logs.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Search by threat, description, or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cyber-input pl-9 w-full text-xs py-2.5"
          />
        </div>
        <div className="relative flex items-center gap-2">
          <Filter className="text-gray-500" size={14} />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="cyber-input text-xs py-2.5 px-3 bg-black min-w-[140px]"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Threats List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 skeleton h-20" />
          ))}
        </div>
      ) : filteredThreats.length === 0 ? (
        <motion.div className="glass-card p-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertTriangle size={48} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-lg font-semibold mb-2 text-white">No Threats Match Criteria</h2>
          <p className="text-xs text-gray-500 mb-6">
            {threats.length === 0
              ? "Upload security logs to start detecting threats. Alerts will appear here in real-time."
              : "Try adjusting your search query or severity filter."}
          </p>
          {threats.length === 0 && (
            <Link href="/logs" className="btn-primary inline-flex items-center gap-2 text-xs">
              <Upload size={12} />
              Upload Logs
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredThreats.map((threat, i) => {
            const isExpanded = expandedThreat === threat.id;
            const color = getRiskColor(threat.severity);

            return (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden"
              >
                {/* Collapsed view summary */}
                <div
                  onClick={() => toggleExpand(threat.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/2 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} style={{ color }} className="flex-shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold font-mono text-white">{threat.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(threat.createdAt).toLocaleDateString()}
                        </span>
                        {threat.affectedIps && threat.affectedIps.length > 0 && (
                          <span className="text-cyan-400">
                            IP: {threat.affectedIps.slice(0, 2).join(", ")}
                            {threat.affectedIps.length > 2 && "..."}
                          </span>
                        )}
                        <span>{threat.occurrences} occurrence(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge-${threat.severity}`}>{threat.severity}</span>
                    {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                  </div>
                </div>

                {/* Expanded Details view */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-900/40 bg-black/20 p-4 space-y-4"
                    >
                      <div>
                        <p className="text-[10px] font-mono uppercase text-gray-500">Threat Description</p>
                        <p className="text-xs text-gray-300 mt-1">{threat.description}</p>
                      </div>

                      {threat.evidence && threat.evidence.length > 0 && (
                        <div>
                          <p className="text-[10px] font-mono uppercase text-gray-500 flex items-center gap-1.5 mb-2">
                            <Terminal size={10} />
                            Log Snippet Evidence
                          </p>
                          <div className="bg-black/80 rounded border border-cyan-500/10 p-3 overflow-x-auto max-h-48 font-mono text-[10px] text-emerald-400 space-y-1.5">
                            {threat.evidence.map((line, idx) => (
                              <div key={idx} className="whitespace-pre truncate select-text">
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detection rules stats */}
      {!loading && threats.length > 0 && (
        <motion.div className="glass-card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-4">Active Rules Summary</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {[
              { name: "Brute Force Attack", count: threats.filter(t => t.type === "brute_force").length, color: "#ff3b5c" },
              { name: "SQL Injection", count: threats.filter(t => t.type === "sql_injection").length, color: "#ff3b5c" },
              { name: "Directory Traversal", count: threats.filter(t => t.type === "directory_traversal").length, color: "#ff8800" },
              { name: "Cross-Site Scripting (XSS)", count: threats.filter(t => t.type === "xss").length, color: "#ffb800" },
            ].map(rule => (
              <div key={rule.name} className="flex justify-between items-center p-3 rounded-lg border border-gray-900 bg-black/20">
                <div className="flex items-center gap-2 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: rule.color }} />
                  <span className="text-gray-400">{rule.name}</span>
                </div>
                <span className="font-bold font-mono text-white">{rule.count} detected</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
