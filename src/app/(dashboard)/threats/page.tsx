"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  Upload,
  Search,
  Filter,
  ShieldAlert,
  Calendar,
  ChevronRight,
  Terminal,
  Clock,
  ExternalLink,
  Info,
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
  aiAnalysis: string | null;
  createdAt: string;
}

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThreats() {
      try {
        const res = await fetch("/api/threats");
        if (!res.ok) throw new Error("Failed to load threats");
        const data = await res.json();
        setThreats(data);
        if (data.length > 0) {
          setSelectedThreatId(data[0].id);
        }
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

  const selectedThreat = threats.find(t => t.id === selectedThreatId);

  const getSeverityCount = (sev: string) => {
    if (sev === "all") return threats.length;
    return threats.filter(t => t.severity === sev).length;
  };

  return (
    <div className="workspace-container overflow-y-auto">
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between h-[60px] border-b border-[#1E2229] pb-3 mb-2">
        <div>
          <h1 className="text-xl font-bold font-heading text-white tracking-tight">Threat Intelligence</h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">Correlated IOC security anomalies</p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert size={13} className="text-red-400 animate-pulse" />
          <span className="font-mono text-[10px] text-red-400 font-bold uppercase tracking-wider">// THREAT_STREAM_ACTIVE</span>
        </div>
      </div>

      {/* ── Controls Row ── */}
      <div className="flex-shrink-0 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-grow max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" size={14} />
          <input
            type="text"
            placeholder="Search threats, signatures, IPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cyber-input pl-10"
          />
        </div>

        {/* Severity Tabs (Horizontal list style) */}
        <div className="flex gap-1.5 flex-wrap">
          {["all", "critical", "high", "medium", "low"].map(sev => {
            const isActive = severityFilter === sev;
            const count = getSeverityCount(sev);
            return (
              <button
                key={sev}
                onClick={() => {
                  setSeverityFilter(sev);
                  // Select first filtered threat
                  const filtered = threats.filter(t => sev === "all" || t.severity === sev);
                  if (filtered.length > 0) {
                    setSelectedThreatId(filtered[0].id);
                  } else {
                    setSelectedThreatId(null);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 capitalize transition-all duration-200 ${
                  isActive
                    ? "bg-[#1E2229] text-white border-[#00E5C3]"
                    : "bg-[#0D1117]/40 border-white/5 text-[#6B7280] hover:border-white/10 hover:text-white"
                }`}
              >
                <span>{sev}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grid Split (Left: Timeline Feed; Right: Investigation Drawer) ── */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 overflow-hidden min-h-0">
        {/* Left Column: Timeline Feed */}
        <div className="glass-card flex flex-col p-0 overflow-hidden h-full">
          <div className="h-[44px] flex-shrink-0 px-5 flex items-center justify-between border-b border-[#1E2229]">
            <span className="font-mono text-[11px] text-[#6B7280] tracking-[0.08em] uppercase">// INCIDENTS TIMELINE</span>
          </div>

          <div className="flex-grow overflow-y-auto p-5 relative min-h-0">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 skeleton rounded-xl" />
                ))}
              </div>
            ) : filteredThreats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-4 max-w-sm mx-auto">
                <AlertTriangle size={32} className="text-[#3D4452]" />
                <div>
                  <h3 className="text-white font-heading font-semibold text-xs">No active alerts matched</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                    Adjust severity filters or upload log files to populate incident vectors.
                  </p>
                </div>
                {threats.length === 0 && (
                  <Link href="/logs" className="btn-primary text-xs flex items-center gap-2 py-2 px-4">
                    <Upload size={12} /> Upload Logs
                  </Link>
                )}
              </div>
            ) : (
              <div className="relative border-l border-[#1E2229] ml-3.5 space-y-4 py-2">
                {filteredThreats.map((threat) => {
                  const isSelected = selectedThreatId === threat.id;
                  const color = getRiskColor(threat.severity);

                  return (
                    <div
                      key={threat.id}
                      onClick={() => setSelectedThreatId(threat.id)}
                      className={`relative pl-8 cursor-pointer group transition-all duration-200`}
                    >
                      {/* Timeline dot marker */}
                      <span
                        className="absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full border bg-[#0A0C0F] transition-transform duration-300 group-hover:scale-125"
                        style={{
                          borderColor: color,
                          boxShadow: isSelected ? `0 0 8px ${color}` : "none",
                          backgroundColor: isSelected ? color : "#0A0C0F",
                        }}
                      />

                      <div
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "bg-[#1A1F27] border-white/10"
                            : "bg-[#0D1117]/30 border-white/5 hover:border-white/10 hover:bg-[#13161B]/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="text-[13px] font-bold text-white font-mono leading-tight">
                              {threat.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-[#6B7280]">
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(threat.createdAt).toLocaleDateString()}
                              </span>
                              <span>·</span>
                              <span>{threat.occurrences} events</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`badge-${threat.severity}`}>{threat.severity}</span>
                            <ChevronRight size={14} className="text-[#3D4452] group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Investigation Panel */}
        <div className="glass-card flex flex-col p-0 overflow-hidden h-full">
          <div className="h-[44px] flex-shrink-0 px-5 flex items-center justify-between border-b border-[#1E2229]">
            <span className="font-mono text-[11px] text-[#6B7280] tracking-[0.08em] uppercase">// INVESTIGATION PANEL</span>
          </div>

          <div className="flex-grow overflow-y-auto p-5 space-y-5 min-h-0">
            {selectedThreat ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getRiskColor(selectedThreat.severity) }} />
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#6B7280]">
                      INCIDENT // {selectedThreat.severity}
                    </span>
                  </div>
                  <h2 className="text-md font-bold text-white mt-1.5 leading-snug">{selectedThreat.title}</h2>
                </div>

                {/* Info summary */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-white/5 bg-[#0D1117]/50 font-mono text-xs text-[#C8C4BC]">
                  <div>
                    <span className="text-[#6B7280] block text-[9px] uppercase tracking-wider">Source Vector</span>
                    <span className="text-white truncate block mt-0.5">{selectedThreat.type}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-[9px] uppercase tracking-wider">Alert Log File</span>
                    <span className="text-white truncate block mt-0.5">{selectedThreat.affectedIps?.[0] || "Auth stream"}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">Anatomy / Details</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{selectedThreat.description}</p>
                </div>

                {/* Evidence snippet */}
                {selectedThreat.evidence && selectedThreat.evidence.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Terminal size={12} className="text-purple-400" />
                      Ingested Log Evidence
                    </h4>
                    <div className="p-3 bg-black/90 border border-white/5 rounded-lg overflow-x-auto font-mono text-[10px] text-emerald-400 select-text max-h-48 divide-y divide-white/5">
                      {selectedThreat.evidence.map((line, idx) => (
                        <div key={idx} className="py-1 first:pt-0 last:pb-0 whitespace-pre truncate">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                {selectedThreat.aiAnalysis && (
                  <div className="p-4 rounded-xl border border-purple-500/15 bg-purple-500/5">
                    <h4 className="text-xs font-heading font-bold text-white flex items-center gap-1.5 mb-2">
                      <Info size={13} className="text-purple-400 animate-pulse" />
                      AI SOC Recommendation Brief
                    </h4>
                    <div className="text-xs text-[#C8C4BC] leading-relaxed prose prose-sm max-w-none">
                      {selectedThreat.aiAnalysis}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] gap-3">
                <Shield size={28} className="text-[#3D4452]" />
                <div>
                  <h4 className="text-white font-heading font-bold text-xs">No Incident Selected</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs leading-relaxed">
                    Select any threat indicator in the timeline list to investigate events, logs, and AI-powered recommendations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
