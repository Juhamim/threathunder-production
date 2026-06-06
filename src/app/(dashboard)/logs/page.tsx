"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  AlertTriangle,
  Shield,
  CheckCircle,
  X,
  Loader2,
  BarChart2,
  ArrowRight,
  Server,
  Database,
  Brain,
  Cpu,
  Zap,
  Activity,
  History,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface ThreatResult {
  type: string;
  severity: string;
  title: string;
  occurrences: number;
}

interface AnalysisResult {
  uploadId: string;
  reportId: string | null;
  stats: {
    totalLines: number;
    logType: string;
    threatsFound: number;
    riskScore: number;
    threats: ThreatResult[];
  };
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const scanSteps = [
  { label: "Parsing & Classifying", desc: "Detecting log format and tokenizing records", icon: Server, color: "#00d9ff" },
  { label: "Correlating Events", desc: "Mapping sessions, IPs, timestamps and paths", icon: Database, color: "#8b5cf6" },
  { label: "Running Detection Engine", desc: "Evaluating heuristic rules and threat patterns", icon: Shield, color: "#ff6b35" },
  { label: "AI Threat Intelligence", desc: "Gemini 2.5 Flash generating incident insights", icon: Brain, color: "#10ffaa" },
];

const LOG_FORMATS = [
  { name: "Apache Access", tag: "access.log", color: "#ff6b35" },
  { name: "Nginx Access", tag: "access.log", color: "#00d9ff" },
  { name: "Linux Syslog", tag: "syslog", color: "#8b5cf6" },
  { name: "Auth Log", tag: "auth.log", color: "#f59e0b" },
  { name: "CSV Telemetry", tag: ".csv", color: "#10ffaa" },
  { name: "Generic Text", tag: ".txt / .log", color: "#6366f1" },
];

function SevBadge({ severity }: { severity: string }) {
  return <span className={`badge-${severity}`}>{severity}</span>;
}

function getRiskColor(score: number) {
  if (score > 75) return "#ff2d55";
  if (score > 45) return "#ff6b35";
  if (score > 25) return "#fbbf24";
  return "#10ffaa";
}

function getRiskLabel(score: number) {
  if (score > 75) return "Critical Risk";
  if (score > 45) return "High Risk";
  if (score > 25) return "Moderate Risk";
  return "Secure";
}

export default function LogsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load scan history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, result]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analyzing) {
      setActiveStep(0);
      interval = setInterval(() => {
        setActiveStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".log", ".txt"],
      "text/csv": [".csv"],
      "application/octet-stream": [".log"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: () => toast.error("File rejected. Max 10MB, text/log/csv only."),
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    setActiveStep(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      await new Promise(r => setTimeout(r, 800));
      setResult(data);
      toast.success(`Analysis complete — ${data.stats.threatsFound} threat(s) detected.`);
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    // Generate a mock file to test the scanner
    const mockContent = `127.0.0.1 - - [06/Jun/2026:12:00:00 +0000] "GET /admin/config.php HTTP/1.1" 200 450
185.220.101.44 - - [06/Jun/2026:12:05:00 +0000] "GET /index.php?id=1%27%20UNION%20SELECT%20null,username,password%20FROM%20users-- HTTP/1.1" 500 230
192.168.1.15 - - [06/Jun/2026:12:10:00 +0000] "POST /login HTTP/1.1" 401 120
192.168.1.15 - - [06/Jun/2026:12:10:02 +0000] "POST /login HTTP/1.1" 401 120
192.168.1.15 - - [06/Jun/2026:12:10:05 +0000] "POST /login HTTP/1.1" 401 120`;
    const blob = new Blob([mockContent], { type: "text/plain" });
    const sampleFile = new File([blob], "sample_nginx_access.log", { type: "text/plain" });
    setFile(sampleFile);
    setResult(null);
    setError(null);
    toast.success("Loaded sample nginx access log. Click 'Analyze' to start!");
  };

  return (
    <div className="workspace-container overflow-y-auto">
      {/* ── Header ── */}
      <motion.div {...fadeUp()} className="flex-shrink-0 flex items-center justify-between h-[60px] border-b border-[#1E2229] pb-3 mb-2">
        <div>
          <h1 className="text-xl font-bold font-heading text-white tracking-tight">Log Analysis</h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">Ingest and parse server telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-purple-400 animate-pulse" />
          <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-wider">// PARSER_ACTIVE</span>
        </div>
      </motion.div>

      {/* ── Main Upload Panel ── */}
      <motion.div {...fadeUp(0.07)} className="glass-card p-0 overflow-hidden flex-shrink-0">
        <div className="px-5 py-4 border-b flex items-center justify-between border-[#1E2229]">
          <div className="flex items-center gap-2.5">
            <Zap size={14} className="text-purple-400" />
            <h2 className="font-bold font-heading text-white text-[15px]">Ingest Telemetry File</h2>
          </div>
          <button
            onClick={handleLoadSample}
            className="btn-ghost text-xs h-[30px] px-3 border-purple-500/30 text-purple-400 hover:bg-purple-500/5 rounded-md"
          >
            Load Sample Log
          </button>
        </div>

        <div className="p-6">
          {!analyzing && !result && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center min-h-[280px] cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-[var(--accent-mint)] bg-[rgba(0,229,195,0.03)] scale-[0.99]"
                  : "border-[#1E2229] bg-[#0D1117]/30 hover:border-purple-500/30 hover:bg-[#13161B]/20"
              }`}
            >
              <input {...getInputProps()} id="log-file-input" />
              <div className="flex flex-col items-center gap-4 text-center max-w-lg">
                {/* Animated Radar Visual */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border border-purple-500/20 bg-purple-500/5">
                  <div
                    className="absolute inset-0 origin-center"
                    style={{
                      animation: "radarSweep 3s linear infinite",
                      background: "conic-gradient(from 0deg, transparent 75%, rgba(139,92,246,0.3) 100%)",
                    }}
                  />
                  <Upload size={24} className="text-purple-400 relative z-10" />
                </div>

                <div>
                  <p className="font-bold text-white text-[16px]">
                    {isDragActive ? "Release to initiate analysis..." : "Drag and drop telemetry log file"}
                  </p>
                  <p className="text-[12px] mt-1.5 text-[var(--text-muted)] leading-relaxed">
                    Supports raw access logs, server telemetry, auth records, and CSV datasets up to 10MB. Processing and pattern checks run locally.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  {LOG_FORMATS.map((fmt) => (
                    <span
                      key={fmt.name}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-md"
                      style={{ background: `${fmt.color}08`, border: `1px solid ${fmt.color}15`, color: fmt.color }}
                    >
                      {fmt.name} ({fmt.tag})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected File Details */}
          <AnimatePresence>
            {file && !analyzing && !result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-purple-500/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/10 border border-purple-500/20">
                    <FileText size={18} className="text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-white font-mono truncate">{file.name}</p>
                    <p className="text-[10px] font-mono mt-0.5 text-[var(--text-muted)]">
                      {(file.size / 1024).toFixed(1)} KB · Operator node ingest ready
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button
                    onClick={() => setFile(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 text-[var(--text-muted)]"
                  >
                    <X size={15} />
                  </button>
                  <button onClick={handleAnalyze} className="btn-primary flex items-center gap-2 text-xs py-2 px-5">
                    <Shield size={12} /> Analyze Ingest
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyzing Progress Loader */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 relative"
            >
              <div className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
                <Loader2 size={16} className="animate-spin text-purple-400" />
              </div>
              <h3 className="text-[13px] font-bold font-heading text-white mb-4 flex items-center gap-2">
                <Activity size={14} className="text-purple-400 animate-pulse" />
                Ingesting File & Tokenizing Lines
              </h3>

              {/* Progress bar */}
              <div className="mb-5 h-1.5 rounded-full overflow-hidden bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                  animate={{ width: `${((activeStep + 1) / scanSteps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>

              <div className="space-y-3">
                {scanSteps.map((step, idx) => {
                  const isCompleted = idx < activeStep;
                  const isActive = idx === activeStep;
                  const Icon = step.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 transition-all duration-300"
                      style={{ opacity: isCompleted || isActive ? 1 : 0.3 }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isCompleted ? "rgba(16,255,170,0.08)" : isActive ? `${step.color}08` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isCompleted ? "rgba(16,255,170,0.2)" : isActive ? `${step.color}25` : "rgba(255,255,255,0.05)"}`,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle size={13} className="text-emerald-400" />
                        ) : isActive ? (
                          <Loader2 size={13} className="animate-spin" style={{ color: step.color }} />
                        ) : (
                          <Icon size={13} className="text-[var(--text-muted)]" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p
                          className="text-[12px] font-mono font-bold"
                          style={{ color: isCompleted ? "#10ffaa" : isActive ? step.color : "var(--text-muted)" }}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{step.desc}</p>
                      </div>
                      {isCompleted && <span className="text-[9px] font-mono text-emerald-400">DONE</span>}
                      {isActive && <span className="text-[9px] font-mono animate-pulse" style={{ color: step.color }}>RUNNING</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Error display */}
          {error && (
            <div className="mt-4 p-4 rounded-xl flex items-center gap-3 border border-red-500/20 bg-red-500/5">
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-[12px] font-mono text-red-400">{error}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Active Scan Results ── */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-shrink-0">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Lines Scanned", value: result.stats.totalLines.toLocaleString(), color: "#00d9ff", icon: FileText },
                { label: "Log Format", value: result.stats.logType.toUpperCase(), color: "#8b5cf6", icon: Cpu },
                { label: "Threats Found", value: result.stats.threatsFound, color: result.stats.threatsFound > 0 ? "#ff2d55" : "#10ffaa", icon: AlertTriangle },
                { label: "Risk Score", value: `${result.stats.riskScore}/100`, color: getRiskColor(result.stats.riskScore), icon: Shield },
              ].map((stat, i) => (
                <div key={stat.label} className="glass-card p-5 text-center flex flex-col justify-center border-t-2" style={{ borderTopColor: `${stat.color}80` }}>
                  <stat.icon size={16} className="mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] uppercase font-mono mt-1 text-[var(--text-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Findings List */}
            {result.stats.threats.length > 0 ? (
              <div className="glass-card overflow-hidden p-0">
                <div className="px-5 py-4 flex items-center justify-between border-b border-[#1E2229]">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={14} className="text-red-400" />
                    <h2 className="font-bold font-heading text-white text-[15px]">
                      Identified Violations <span className="text-[var(--text-muted)] font-normal">({result.stats.threats.length})</span>
                    </h2>
                  </div>
                  <span className={`badge-${result.stats.riskScore > 75 ? "critical" : result.stats.riskScore > 45 ? "high" : "medium"}`}>
                    {getRiskLabel(result.stats.riskScore)}
                  </span>
                </div>
                <div className="divide-y divide-[#161A20]">
                  {result.stats.threats.map((threat, i) => {
                    const sColor = threat.severity === "critical" ? "#ff2d55" : threat.severity === "high" ? "#ff6b35" : "#fbbf24";
                    return (
                      <div key={i} className="px-5 py-4 flex items-center justify-between gap-3 transition-colors hover:bg-white/[0.01]" style={{ borderLeft: `3px solid ${sColor}35` }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10">
                            <AlertTriangle size={13} style={{ color: sColor }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-white font-heading">{threat.title}</p>
                            <p className="text-[10px] font-mono mt-0.5 text-[var(--text-muted)]">
                              {threat.occurrences} occurrences flagged
                            </p>
                          </div>
                        </div>
                        <SevBadge severity={threat.severity} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card p-10 text-center" style={{ borderColor: "rgba(16,255,170,0.12)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[rgba(16,255,170,0.08)] border border-[rgba(16,255,170,0.2)]">
                  <CheckCircle size={24} className="text-emerald-400" />
                </div>
                <p className="font-bold font-heading text-white text-lg">Clean Analysis Run</p>
                <p className="text-[12px] mt-2 text-[var(--text-muted)]">
                  Heuristic matching engine completed checking records with zero incident alerts triggered.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-3">
              {result.reportId && (
                <Link href={`/reports/${result.reportId}`} className="btn-primary flex items-center justify-center gap-2 py-3 text-[13px]">
                  <BarChart2 size={14} /> View SOC Incident Report <ArrowRight size={13} />
                </Link>
              )}
              <button onClick={() => { setFile(null); setResult(null); }} className="btn-ghost flex items-center justify-center gap-2 py-3 text-[13px]">
                <Upload size={14} /> Reset and Load Another Log
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scan History Table ── */}
      {!analyzing && !result && (
        <motion.div {...fadeUp(0.15)} className="glass-card p-0 overflow-hidden flex-shrink-0">
          <div className="px-5 py-4 border-b flex items-center gap-2.5 border-[#1E2229]">
            <History size={15} className="text-purple-400" />
            <h2 className="font-bold font-heading text-white text-[15px]">Recent Log Analyses</h2>
          </div>

          <div className="overflow-x-auto">
            {loadingHistory ? (
              <div className="p-10 text-center space-y-3">
                <Loader2 size={24} className="animate-spin mx-auto text-purple-500" />
                <p className="text-xs text-[var(--text-muted)] font-mono">RETRIEVING_INGESTION_LOGS...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-12 text-center max-w-sm mx-auto space-y-3">
                <FileText size={32} className="text-[#3D4452] mx-auto" />
                <h3 className="text-white font-heading font-semibold text-xs">No scan history available</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Uploaded logs and analysis reports will list here once you complete a scan session.
                </p>
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs text-[#C8C4BC]">
                <thead>
                  <tr className="bg-[#0D1117] border-b border-[#1E2229] h-[36px] text-[#3D4452] uppercase font-bold tracking-wider">
                    <th className="px-5">Analysis Title / ID</th>
                    <th className="px-5">Date</th>
                    <th className="px-5">Risk score</th>
                    <th className="px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2229]">
                  {history.slice(0, 5).map((rep) => (
                    <tr key={rep.id} className="h-[44px] hover:bg-[#1A1F27] transition-colors">
                      <td className="px-5 font-bold text-white max-w-[280px] truncate">{rep.title}</td>
                      <td className="px-5 text-[var(--text-muted)]">{new Date(rep.createdAt).toLocaleDateString()}</td>
                      <td className="px-5">
                        <span className="font-bold" style={{ color: getRiskColor(rep.riskScore) }}>
                          {rep.riskScore}/100
                        </span>
                      </td>
                      <td className="px-5 text-right">
                        <Link href={`/reports/${rep.id}`} className="btn-ghost h-[28px] px-3.5 inline-flex items-center gap-1.5 rounded-md text-[11px]">
                          <Eye size={12} /> View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
