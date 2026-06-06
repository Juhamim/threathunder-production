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
} from "lucide-react";
import { toast } from "sonner";

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

  const handleQuickReport = () => {
    toast.success("Quick Threat Report drafted. Operator action recorded.");
  };

  // ─── DYNAMIC SELECTORS FROM DB TELEMETRY ────────────────────────────

  // 1. Dynamically group threat IPs to show mobile Top Attack Sources
  const topSources = stats?.recentThreats
    ? Object.values(
        stats.recentThreats.reduce((acc: any, threat: any) => {
          const key = threat.ip;
          if (!acc[key]) {
            acc[key] = { ip: threat.ip, country: threat.file || "System Ingest", probes: 0, severity: threat.severity };
          }
          acc[key].probes += 1;
          return acc;
        }, {})
      )
        .sort((a: any, b: any) => b.probes - a.probes)
        .slice(0, 5)
    : [];

  // 2. Dynamically distribute threat points onto the World Map Coordinates
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
      <div className="space-y-4">
        <div className="h-6 w-48 skeleton" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 h-72 skeleton" />
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
    <div className="h-full flex flex-col gap-3 overflow-hidden select-none">
      {/* ── Page Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-[var(--accent-mint)] animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
            OPERATOR_NODE // ACTIVE_INGEST
          </span>
        </div>
        <h1 className="text-[22px] font-heading font-semibold text-white leading-none">Security Command Console</h1>
      </div>

      {/* ── Metric Cards Row ── */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3">
        {[
          { label: "LOGS SCANNED", value: stats.totalLogsScanned.toLocaleString(), trend: "+2.4%", labelColor: "var(--text-primary)" },
          { label: "THREATS FLAGGED", value: stats.totalThreats, trend: "SYSTEM MATCH", labelColor: "var(--color-warning)" },
          { label: "CRITICAL ALERTS", value: stats.criticalAlerts, trend: "REQUIRED ACTIONS", labelColor: "var(--color-danger)" },
          { label: "RISK LEVEL", value: `${stats.riskScore}/100`, trend: riskLabel.toUpperCase(), labelColor: riskColor },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            {...fadeUp(i * 0.03)}
            className="bg-[#13161B] border border-[#1E2229] rounded-[4px] p-4 flex flex-col justify-between"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#6B7280]">
                {card.label}
              </p>
              <h3
                className="font-bold tracking-tight font-heading mt-[6px] text-white"
                style={{ fontSize: "clamp(28px, 3vw, 36px)", lineHeight: 1 }}
              >
                {card.value}
              </h3>
            </div>
            <div className="flex items-center justify-between mt-[6px]">
              <span className="font-mono text-[10px] text-[#3D4452]">TREND</span>
              <span className="font-mono text-[12px] font-bold" style={{ color: card.labelColor }}>
                {card.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Asymmetric Layout Grid (Feed on left, tactical panels on right) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-3 overflow-hidden h-full">
        {/* Left Panel (Feed) */}
        <div className="bg-[#13161B] border border-[#1E2229] rounded-[4px] flex flex-col overflow-hidden h-full">
          {/* Panel Header */}
          <div className="h-[40px] flex-shrink-0 px-[16px] flex items-center justify-between border-b border-[#161A20]">
            <span className="font-mono text-[11px] text-[#6B7280] tracking-[0.08em] uppercase">// ACTIVE INCIDENT FEEDS</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[var(--accent-mint)] rounded-full animate-pulse" />
              <span className="font-mono text-[10px] text-[var(--accent-mint)] font-bold">REAL_TIME</span>
            </div>
          </div>

          {/* Table Column headers */}
          <div className="h-[32px] flex-shrink-0 px-[16px] flex items-center bg-[#0D1117] border-b border-[#1E2229]">
            <div className="grid grid-cols-[32px_1fr_120px_120px_64px_80px_80px] w-full gap-2 items-center font-mono text-[10px] text-[#3D4452] uppercase tracking-[0.08em] font-bold">
              <span>Sev</span>
              <span>Threat Type</span>
              <span>Source IP</span>
              <span>File Asset</span>
              <span>Time</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
          </div>

          {/* Table Body Scroll Area (Real DB Threats list) */}
          <div className="flex-grow overflow-y-auto divide-y divide-[#161A20]">
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
                    className="h-[40px] px-[16px] flex items-center hover:bg-[#1A1F27] transition-colors group"
                    style={{
                      backgroundColor: idx % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent",
                    }}
                  >
                    <div className="grid grid-cols-[32px_1fr_120px_120px_64px_80px_80px] w-full gap-2 items-center">
                      {/* Severity dot */}
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                      </div>
                      {/* Threat Type */}
                      <div className="font-heading font-semibold text-[13px] text-[#F0EDE6] truncate">{threat.type}</div>
                      {/* Source IP */}
                      <div className="font-mono text-[12px] text-[#C8C4BC] truncate">{threat.ip}</div>
                      {/* File Asset */}
                      <div className="font-mono text-[12px] text-[#6B7280] truncate">{threat.file}</div>
                      {/* Timestamp */}
                      <div className="font-mono text-[11px] text-[#6B7280]">{threat.time}</div>
                      {/* Status badge */}
                      <div>
                        <span
                          className="border-l-[2px] pl-2 text-[10px] font-mono font-bold"
                          style={{ borderColor: dotColor, color: dotColor }}
                        >
                          {threat.status || "OPEN"}
                        </span>
                      </div>
                      {/* Action buttons (revealed on hover) */}
                      <div className="text-right flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDismissThreat(threat.id)}
                          className="p-1 hover:text-[var(--color-danger)] transition-colors"
                          title="Dismiss alert"
                        >
                          <X size={14} />
                        </button>
                        <button
                          className="p-1 hover:text-[var(--accent-mint)] transition-colors"
                          title="Investigate target"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-2">
                <Shield size={24} className="text-[#6B7280]" />
                <div className="text-white font-heading font-semibold text-xs">No Active Threats Detected</div>
                <div className="font-mono text-[11px] text-[#6B7280]">Last checked: just now</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="flex flex-col gap-3 h-full overflow-hidden w-[380px]">
          {/* Threat Map Panel (flex 0 0 55%) */}
          <div className="bg-[#13161B] border border-[#1E2229] rounded-[4px] flex-[0_0_55%] flex flex-col overflow-hidden relative">
            <div className="h-[40px] flex-shrink-0 px-[16px] flex items-center justify-between border-b border-[#161A20]">
              <span className="font-mono text-[11px] text-[#6B7280] tracking-[0.08em] uppercase">// TACTICAL THREAT RADAR</span>
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-3">
              <svg viewBox="0 0 100 50" className="w-full h-full text-[#1E2229] max-w-[340px]">
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
                    className="absolute bottom-2 left-2 right-2 p-2 border border-[#1E2229] bg-[#0D1117] text-[10px] font-mono z-50"
                  >
                    <div className="text-white font-bold">{hoveredDot.type}</div>
                    <div className="text-[var(--accent-mint)]">{hoveredDot.ip} ({hoveredDot.country})</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Severity Breakdown Chart (flex-1) */}
          <div className="bg-[#13161B] border border-[#1E2229] rounded-[4px] flex-grow flex flex-col overflow-hidden">
            <div className="h-[40px] flex-shrink-0 px-[16px] flex items-center justify-between border-b border-[#161A20]">
              <span className="font-mono text-[11px] text-[#6B7280] tracking-[0.08em] uppercase">// INCIDENTS CATEGORIZATION</span>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto min-h-0 gap-3">
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
                    <div className="h-1.5 border border-[#1E2229] bg-[#0A0C0F] overflow-hidden relative">
                      <div
                        className="h-full"
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

      {/* Floating Action Button (FAB) on mobile (xs/sm only) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={handleQuickReport}
          className="w-12 h-12 rounded-full bg-[var(--accent-mint)] text-[var(--bg-void)] flex items-center justify-center shadow-lg border border-[var(--accent-mint)] hover:bg-[var(--accent-mint-dim)] transition-colors focus:outline-none"
          title="Report Active Threat Incident"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* CSS Pulse styles for radar dots */}
      <style jsx global>{`
        @keyframes radarPing {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: radarPing 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>
    </div>
  );
}
