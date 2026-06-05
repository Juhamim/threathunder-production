"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Shield, AlertTriangle, FileText, TrendingUp,
  Upload, MessageSquare, GitBranch, Activity, ArrowRight,
  RefreshCw, Terminal, Layers,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  return (
    <motion.div className="glass-card p-6" whileHover={{ y: -2 }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{title}</p>
          <p className="text-3xl font-bold mt-1 font-mono" style={{ color }}>{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
      {trend && <p className="text-xs mt-1" style={{ color: "#00ff88" }}>{trend}</p>}
    </motion.div>
  );
}

function SevBadge({ severity }: { severity: string }) {
  return <span className={`badge-${severity}`}>{severity}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(0,217,255,0.2)" }}>
        <p style={{ color: "var(--text-muted)" }} className="mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isDbOffline, setIsDbOffline] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.isEmpty) {
        setIsEmpty(true);
        setIsDbOffline(!!data.isDbOffline);
      } else {
        setStats(data.stats);
        setIsEmpty(false);
        setIsDbOffline(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to threat telemetry API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedSandbox = async () => {
    if (isDbOffline) {
      toast.error("Database connection is offline. Configure DATABASE_URL first.");
      return;
    }
    try {
      setSeeding(true);
      const res = await fetch("/api/dashboard/stats", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Sandbox Honeypot Telemetry Seeded successfully.");
        await fetchStats();
      } else {
        toast.error("Failed to seed sandbox database.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Seeding operation encountered a network error.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 skeleton" />
          <div className="h-72 skeleton" />
        </div>
      </div>
    );
  }

  // ─── Render Empty Command Center ─────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl glass-card p-10 border border-cyan-500/10 shadow-2xl relative overflow-hidden"
        >
          {/* Faint rotating scanner element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 bg-cyan-950/30 border border-cyan-500/20">
            <Terminal className="text-cyan-400" size={28} />
          </div>

          <h2 className="text-2xl font-bold font-heading text-white tracking-tight">Security Console Offline</h2>
          <p className="text-xs text-gray-400 font-mono mt-2 uppercase tracking-wider">
            Status: {isDbOffline ? "DATABASE_OFFLINE" : "NO_TELEMETRY_INGESTED"}
          </p>
          
          {isDbOffline ? (
            <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-950/5 flex items-start gap-2.5 max-w-sm mx-auto">
              <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] font-mono text-red-400 text-left leading-normal">
                DATABASE_CONNECTION_ERROR: Please configure a valid DATABASE_URL in your .env.local file to initialize migrations and load metrics.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-4 leading-relaxed max-w-sm mx-auto">
              ThreatHunter AI is waiting for logs to analyze. Upload log files from your servers or seed sandbox telemetry logs to preview the system.
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/logs" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-xs py-3 px-6">
              <Upload size={14} /> Ingest Raw Logs
            </Link>
            <button
              onClick={handleSeedSandbox}
              disabled={seeding || isDbOffline}
              className={`btn-ghost w-full sm:w-auto flex items-center justify-center gap-2 text-xs py-3 px-6 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5 hover:text-emerald-300 ${isDbOffline ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={14} className={seeding ? "animate-spin" : ""} />
              {seeding ? "Injecting Logs..." : "Load Sandbox Demo Logs"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Render Ingested Stats ───────────────────────────────────────────────
  const riskScoreData = [{ name: "Risk", value: stats.riskScore, fill: stats.riskScore > 75 ? "#ff3b5c" : stats.riskScore > 45 ? "#ff8800" : "#00ff88" }];
  const riskLabel = stats.riskScore > 75 ? "Critical Risk" : stats.riskScore > 45 ? "High Risk" : stats.riskScore > 25 ? "Moderate Risk" : "Secure";

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Security Command Console</h1>
          <p className="text-xs font-mono mt-1 text-gray-400">
            OPERATOR: {session?.user?.name?.toUpperCase() ?? "SOC_ANALYST"} // HOST: LOCALHOST
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="btn-ghost flex items-center gap-2 text-xs px-4 py-2 border-cyan-500/10 text-cyan-400"
        >
          <RefreshCw size={12} /> Sync Feed
        </button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Logs Scanned", value: stats.totalLogsScanned, subtitle: "Database entries", icon: FileText, color: "#00d9ff" },
          { title: "Threats Flagged", value: stats.totalThreats, subtitle: "Pattern occurrences", icon: AlertTriangle, color: "#ff8800" },
          { title: "Critical Alerts", value: stats.criticalAlerts, subtitle: "Require immediate action", icon: Shield, color: "#ff3b5c" },
          { title: "Consolidated Risk", value: `${stats.riskScore}/100`, subtitle: riskLabel, icon: TrendingUp, color: riskScoreData[0].fill },
        ].map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Threat Trends - spans 2 cols */}
        <motion.div className="glass-card p-5 lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold font-heading text-white">Threat Vectors Timeline (7 Days)</h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE FEED</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.threatTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                {[
                  { id: "critical", color: "#ff3b5c" },
                  { id: "high", color: "#ff8800" },
                  { id: "medium", color: "#ffb800" },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="critical" stroke="#ff3b5c" fill="url(#grad-critical)" strokeWidth={1.5} name="Critical" />
              <Area type="monotone" dataKey="high" stroke="#ff8800" fill="url(#grad-high)" strokeWidth={1.5} name="High" />
              <Area type="monotone" dataKey="medium" stroke="#ffb800" fill="url(#grad-medium)" strokeWidth={1.5} name="Medium" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk Score Gauge */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="text-sm font-bold font-heading text-white">Posture Risk Score</h2>
          <p className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">Calculated Threat Rating</p>
          
          <div className="relative flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart cx="50%" cy="75%" innerRadius="70%" outerRadius="90%"
                startAngle={180} endAngle={180 - (stats.riskScore / 100) * 180} data={riskScoreData}>
                <RadialBar dataKey="value" cornerRadius={10} fill={riskScoreData[0].fill} background={{ fill: "rgba(255,255,255,0.02)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute text-center" style={{ top: "52%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <div className="text-4xl font-black font-mono" style={{ color: riskScoreData[0].fill }}>{stats.riskScore}</div>
              <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">SCORE</div>
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={stats.riskScore > 75 ? "badge-critical" : stats.riskScore > 45 ? "badge-high" : stats.riskScore > 25 ? "badge-medium" : "badge-low"}>
              {riskLabel}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Attack Categories Pie */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-sm font-bold font-heading text-white mb-4">Attack Signatures Distribution</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie data={stats.attackCategories} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={2}>
                  {stats.attackCategories.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stats.attackCategories.map((cat: any) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    <span style={{ color: "var(--text-secondary)" }} className="font-mono text-[11px]">{cat.name}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: cat.color }}>{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Log Volume */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="text-sm font-bold font-heading text-white mb-4">Ingestion Telemetry Volume</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.logVolumeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="hour" tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Lines Ingested" radius={[4, 4, 0, 0]}>
                {stats.logVolumeData.map((_: any, i: number) => (
                  <Cell key={i} fill={i === stats.logVolumeData.length - 1 ? "#00d9ff" : "rgba(0, 217, 255, 0.25)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Threats Table */}
      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="p-5 flex items-center justify-between border-b border-gray-900/50">
          <h2 className="text-sm font-bold font-heading text-white">Recent Threats Log</h2>
          <Link href="/threats" className="text-xs font-heading flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors">
            View Console Logs <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Threat Pattern</th>
                <th>Source Host / IP</th>
                <th>Risk Level</th>
                <th>Ingested File</th>
                <th>Time Detected</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentThreats.map((threat: any) => (
                <tr key={threat.id}>
                  <td className="font-bold text-white font-heading">{threat.type}</td>
                  <td className="font-mono text-xs text-cyan-400">{threat.ip}</td>
                  <td><SevBadge severity={threat.severity} /></td>
                  <td className="text-xs text-gray-500 font-mono">{threat.file}</td>
                  <td className="text-xs text-gray-500 font-mono">{threat.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Console Actions */}
      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <h2 className="text-sm font-bold font-heading text-white mb-4">Tactical Console Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/logs", icon: Upload, label: "Upload Log Files", color: "#00d9ff" },
            { href: "/scanner", icon: GitBranch, label: "Scan Codebase", color: "#8b5cf6" },
            { href: "/reports", icon: FileText, label: "Incident Briefings", color: "#00ff88" },
            { href: "/chat", icon: MessageSquare, label: "Ask Security AI", color: "#ffb800" },
          ].map((action) => (
            <Link key={action.href} href={action.href}
              className="flex flex-col items-center gap-2.5 p-4 rounded-lg transition-all text-center group border border-gray-900/50"
              style={{ background: "rgba(10,10,10,0.5)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = action.color + "30"; e.currentTarget.style.background = action.color + "08"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.02)"; e.currentTarget.style.background = "rgba(10,10,10,0.5)"; }}>
              <action.icon size={18} style={{ color: action.color }} />
              <span className="text-xs font-mono font-medium text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
