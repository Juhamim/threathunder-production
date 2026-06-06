"use client";

import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Shield,
  ArrowRight,
  Cpu,
  Plus,
  X,
  Server,
  Activity,
  Heart,
  Database,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Animated entry transitions
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, delay, ease: [0.16, 1, 0.3, 1] as const },
});

interface MapDot {
  id: string;
  ip: string;
  country: string;
  type: string;
  x: number;
  y: number;
  active: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [animateBars, setAnimateBars] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<MapDot | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data.stats);
      setTimeout(() => setAnimateBars(true), 120);
    } catch {
      toast.error("Failed to load telemetry stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDismissThreat = (id: string) => {
    toast.success(`Dismissed incident threat code [${id}]`);
  };

  // Dynamically map coordinates for World Map visual
  const mapDots: MapDot[] = stats?.recentThreats
    ? stats.recentThreats.map((threat: any, idx: number) => {
        const coords = [
          { x: 62, y: 18 }, // Europe / Russia
          { x: 76, y: 24 }, // Asia
          { x: 20, y: 22 }, // North America
          { x: 50, y: 14 }, // Northern Europe
          { x: 34, y: 38 }, // South America
        ];
        const coord = coords[idx % coords.length];
        return {
          id: threat.id,
          ip: threat.ip,
          country: threat.file || "System Log Node",
          type: threat.type,
          x: coord.x,
          y: coord.y,
          active: threat.severity === "critical" || threat.severity === "high",
        };
      })
    : [];

  if (loading) {
    return (
      <div className="workspace-container">
        <div className="page-header">
          <div className="skeleton h-5 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[130px] skeleton" />
          ))}
        </div>
        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          <div className="h-72 skeleton" />
          <div className="h-72 skeleton" />
        </div>
      </div>
    );
  }

  const riskColor =
    stats.riskScore > 75
      ? "var(--color-danger)"
      : stats.riskScore > 45
      ? "var(--color-warning)"
      : "var(--accent-mint)";

  const riskLabel =
    stats.riskScore > 75 ? "Critical Risk" : stats.riskScore > 45 ? "High Risk" : "Secure";

  return (
    <div className="workspace-container">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="text-[18px] font-bold font-heading text-white tracking-tight leading-tight">Dashboard</h1>
          <p className="text-[12px] text-[var(--text-muted)] font-medium mt-0.5">Real-Time Threat Monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--accent-mint)] rounded-full animate-pulse" />
          <span className="font-mono text-[11px] text-[var(--accent-mint)] font-bold tracking-wider">// AGENT_ONLINE</span>
        </div>
      </div>

      {/* ── Metric Cards Row ── */}
      <div className="flex-shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "LOGS SCANNED",   value: stats.totalLogsScanned.toLocaleString(), trend: "+2.4%",         desc: "vs last 24h",      color: "var(--accent-mint)",  spark: [30,45,35,60,50,75,90] },
          { label: "THREATS FLAGGED", value: stats.totalThreats,                     trend: "SYSTEM MATCH",  desc: "active signatures", color: "var(--color-warning)",spark: [10,25,15,35,20,45,30] },
          { label: "CRITICAL ALERTS", value: stats.criticalAlerts,                   trend: "ACTION REQD",   desc: "needs attention",   color: "var(--color-danger)", spark: [5,12,8,15,10,18,15]  },
          { label: "RISK LEVEL",      value: `${stats.riskScore}/100`,               trend: riskLabel.toUpperCase(), desc: "current status", color: riskColor,             spark: [80,70,65,60,55,50,45] },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            {...fadeUp(i * 0.03)}
            className="glass-card flex flex-col justify-between"
            style={{ minHeight: "120px" }}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#6B7280] leading-none">{card.label}</p>
                <h3 className="font-bold tracking-tight font-heading mt-2 text-white" style={{ fontSize: "22px" }}>
                  {card.value}
                </h3>
              </div>
              {/* Sparkline */}
              <div className="w-14 h-7 opacity-60 flex-shrink-0 ml-2">
                <svg viewBox="0 0 70 30" className="w-full h-full">
                  <path
                    d={`M ${card.spark.map((val, idx) => `${idx * 10},${30 - val * 30 / 100}`).join(" L ")}`}
                    fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] border-t border-white/5 pt-2 mt-2">
              <span className="text-[#6b7280] truncate">{card.desc}</span>
              <span className="font-mono font-bold flex-shrink-0 ml-2" style={{ color: card.color }}>{card.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Asymmetric Layout Grid (Feed on left, tactical panels on right) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 overflow-hidden h-full min-h-0">
        {/* Left Panel (Feed) */}
        <div className="glass-card flex flex-col overflow-hidden h-full p-0">
          {/* Panel Header */}
          <div className="h-[48px] flex-shrink-0 px-5 flex items-center justify-between border-b border-[#1E2229]">
            <span className="font-mono text-[11px] text-[#6B7280] tracking-[0.08em] uppercase">// ACTIVE INCIDENT FEED</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[var(--accent-mint)] rounded-full animate-pulse" />
              <span className="font-mono text-[10px] text-[var(--accent-mint)] font-bold">REAL_TIME</span>
            </div>
          </div>

          {/* Table Column headers — responsive grid (hidden columns on narrow) */}
          <div className="h-[36px] flex-shrink-0 px-4 flex items-center bg-[#0D1117] border-b border-[#1E2229]">
            <div className="grid w-full gap-3 items-center font-mono text-[10px] text-[#3D4452] uppercase tracking-[0.08em] font-bold"
              style={{ gridTemplateColumns: "28px 1fr 110px 110px 56px 72px 72px" }}>
              <span>Sev</span>
              <span>Threat Type</span>
              <span className="hidden sm:block">Source IP</span>
              <span className="hidden md:block">File Asset</span>
              <span className="hidden sm:block">Time</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
          </div>

          {/* Table Body Scroll Area (Real DB Threats list) */}
          <div className="flex-grow overflow-y-auto divide-y divide-[#161A20] min-h-0">
            {stats.recentThreats && stats.recentThreats.length > 0 ? (
              stats.recentThreats.map((threat: any, idx: number) => {
                const dotColor =
                  threat.severity === "critical"
                    ? "var(--color-danger)"
                    : threat.severity === "high"
                    ? "var(--color-warning)"
                    : "var(--accent-mint)";

                return (
                  <div
                    key={threat.id}
                    className="h-[44px] px-5 flex items-center hover:bg-[#1A1F27] transition-colors group"
                    style={{
                      backgroundColor: idx % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent",
                    }}
                  >
                    <div
                      className="grid w-full gap-3 items-center"
                      style={{ gridTemplateColumns: "28px 1fr 110px 110px 56px 72px 72px" }}
                    >
                      {/* Severity dot */}
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                      </div>
                      {/* Threat Type */}
                      <div className="font-heading font-semibold text-[13px] text-[#F0EDE6] truncate">{threat.type}</div>
                      {/* Source IP */}
                      <div className="font-mono text-[11px] text-[#C8C4BC] truncate hidden sm:block">{threat.ip}</div>
                      {/* File Asset */}
                      <div className="font-mono text-[11px] text-[#6B7280] truncate hidden md:block">{threat.file}</div>
                      {/* Timestamp */}
                      <div className="font-mono text-[10px] text-[#6B7280] hidden sm:block">{threat.time}</div>
                      {/* Status badge */}
                      <div>
                        <span
                          className="border-l-[2px] pl-2 text-[10px] font-mono font-bold truncate"
                          style={{ borderColor: dotColor, color: dotColor }}
                        >
                          {threat.status || "OPEN"}
                        </span>
                      </div>
                      {/* Action buttons */}
                      <div className="text-right flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDismissThreat(threat.id)} className="p-1 hover:text-[var(--color-danger)] transition-colors" title="Dismiss">
                          <X size={13} />
                        </button>
                        <Link href="/threats" className="p-1 hover:text-[var(--accent-mint)] transition-colors" title="Investigate">
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                  <Shield size={28} className="text-[#6B7280]" />
                </div>
                <div>
                  <h3 className="text-white font-heading font-bold mb-1">No Active Incidents Detected</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    ThreatHunter has not flagged any log anomalies or vulnerable keys yet. Upload telemetry logs or trigger a GitHub repository scanner to start hunting.
                  </p>
                </div>
                <Link href="/logs" className="btn-primary text-xs flex items-center gap-2">
                  <Plus size={14} /> Upload Logs
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto min-h-0">
          {/* Threat Radar Panel */}
          <div className="glass-card flex flex-col overflow-hidden relative p-0 h-[260px] flex-shrink-0">
            <div className="h-[44px] flex-shrink-0 px-5 flex items-center justify-between border-b border-[#1E2229]">
              <span className="font-mono text-[11px] text-[#6B7280] tracking-[0.08em] uppercase">// TACTICAL THREAT RADAR</span>
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-3">
              <svg viewBox="0 0 100 50" className="w-full h-full text-[#1E2229] max-w-[320px]">
                {/* Simulated lightweight continent shapes */}
                <path d="M5,12 Q15,8 22,14 T30,12 T38,18 T22,35 Z" fill="#1E2229" stroke="#2A3040" strokeWidth="0.5" />
                <path d="M42,8 Q50,6 60,12 T70,8 T80,16 T65,32 Z" fill="#1E2229" stroke="#2A3040" strokeWidth="0.5" />
                <path d="M68,22 Q75,20 85,24 T90,30 T80,38 Z" fill="#1E2229" stroke="#2A3040" strokeWidth="0.5" />

                {/* Radar Concentric Rings */}
                <circle cx="50" cy="25" r="12" fill="none" stroke="#161A20" strokeWidth="0.3" strokeDasharray="1 2" />
                <circle cx="50" cy="25" r="24" fill="none" stroke="#161A20" strokeWidth="0.3" strokeDasharray="1 2" />

                {/* Pulsing Hotspots */}
                {mapDots.map((dot) => (
                  <g
                    key={dot.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDot(dot)}
                    onMouseLeave={() => setHoveredDot(null)}
                  >
                    {dot.active && (
                      <circle cx={dot.x} cy={dot.y} r="3.5" fill="none" stroke="var(--accent-mint)" strokeWidth="0.4">
                        <animate attributeName="r" values="1.2;4.5;1.2" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={dot.x} cy={dot.y} r="1.3" fill={dot.active ? "var(--accent-mint)" : "#6B7280"} />
                  </g>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              <AnimatePresence>
                {hoveredDot && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-2 left-2 right-2 p-2 border border-[#1E2229] bg-[#0D1117] text-[10px] font-mono z-50 rounded-md"
                  >
                    <div className="text-white font-bold">{hoveredDot.type}</div>
                    <div className="text-[var(--accent-mint)]">{hoveredDot.ip} ({hoveredDot.country})</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* System Health Widget */}
          <div className="glass-card p-5 space-y-4 flex-shrink-0">
            <h3 className="text-xs font-mono text-[#6B7280] uppercase tracking-[0.08em]">// SYSTEM SECURITY STATUS</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0A0C0F] border border-white/5">
                <Server size={14} className="text-[var(--accent-mint)]" />
                <div>
                  <p className="text-[10px] text-[#6b7280] font-mono">DATABASE</p>
                  <p className="font-bold text-white leading-none mt-1">CONNECTED</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0A0C0F] border border-white/5">
                <Activity size={14} className="text-[var(--accent-mint)]" />
                <div>
                  <p className="text-[10px] text-[#6b7280] font-mono">BUFFER RATE</p>
                  <p className="font-bold text-white leading-none mt-1">OPTIMAL</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0A0C0F] border border-white/5">
                <Heart size={14} className="text-[var(--accent-mint)]" />
                <div>
                  <p className="text-[10px] text-[#6b7280] font-mono">HEURISTICS</p>
                  <p className="font-bold text-white leading-none mt-1">7 / 7 RULES</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0A0C0F] border border-white/5">
                <Clock size={14} className="text-[var(--accent-mint)]" />
                <div>
                  <p className="text-[10px] text-[#6b7280] font-mono">LATENCY</p>
                  <p className="font-bold text-white leading-none mt-1">&lt; 15MS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Severity Breakdown Progress Rows */}
          <div className="glass-card flex flex-col p-5 gap-3 flex-grow min-h-0">
            <h3 className="text-xs font-mono text-[#6B7280] uppercase tracking-[0.08em] mb-1">// INCIDENT SEVERITY DENSITY</h3>
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {[
                { label: "Critical", count: stats.criticalAlerts, color: "#FF4D4D", total: stats.totalThreats || 1 },
                { label: "High", count: stats.highAlerts || 0, color: "#F5A623", total: stats.totalThreats || 1 },
                { label: "Medium", count: stats.mediumAlerts || 0, color: "#00E5C3", total: stats.totalThreats || 1 },
                { label: "Low", count: stats.lowAlerts || 0, color: "#6B7280", total: stats.totalThreats || 1 },
              ].map((row, idx) => {
                const percentage = Math.round((row.count / row.total) * 100);
                return (
                  <div key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#C8C4BC] uppercase">{row.label}</span>
                      <span style={{ color: row.color }} className="font-bold">
                        {row.count} ({percentage}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 border border-[#1E2229] bg-[#0A0C0F] overflow-hidden relative rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: row.color,
                          width: animateBars ? `${percentage}%` : "0%",
                          transition: `width 400ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
