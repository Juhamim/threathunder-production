"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, FileText, AlertTriangle, Shield, CheckCircle,
  X, Loader2, BarChart2, ArrowRight,
  Activity, Server, Database, Brain, Cpu, Zap,
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
  { name: "Apache", tag: "access.log", color: "#ff6b35" },
  { name: "Nginx", tag: "access.log", color: "#00d9ff" },
  { name: "Syslog", tag: "syslog", color: "#8b5cf6" },
  { name: "Auth Log", tag: "auth.log", color: "#f59e0b" },
  { name: "CSV", tag: ".csv", color: "#10ffaa" },
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

  return (
    <div className="w-full max-w-[1500px] mx-auto space-y-5">
      {/* ── Header ── */}
      <motion.div {...fadeUp()}>
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={13} className="text-purple-400" />
          <span className="text-[10px] font-mono tracking-widest" style={{ color: "var(--text-muted)" }}>
            SEC.DEV // LOG_INGESTION_ENGINE
          </span>
        </div>
        <h1 className="text-2xl font-black font-heading text-white tracking-tight">Log Analysis Console</h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
          Upload server logs for AI-powered threat detection and incident reporting.
        </p>
      </motion.div>

      {/* ── Upload Card ── */}
      <motion.div {...fadeUp(0.07)} className="glass-card glass-card-accent-purple overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5">
            <Zap size={14} className="text-purple-400" />
            <h2 className="font-bold font-heading text-white text-[15px]">Ingest Telemetry File</h2>
          </div>
          {file && !analyzing && !result && (
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}>
              FILE_READY
            </span>
          )}
        </div>

        <div className="p-5">
          {!analyzing && !result && (
            <div {...getRootProps()} className={`drop-zone ${isDragActive ? "active" : ""}`}>
              <input {...getInputProps()} id="log-file-input" />
              <div className="flex flex-col items-center gap-4">
                {/* Animated Radar */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ border: "1px solid rgba(0,217,255,0.2)", background: "rgba(0,217,255,0.03)" }}>
                  <div className="absolute inset-0 origin-center"
                    style={{ animation: "radarSweep 3s linear infinite", background: "conic-gradient(from 0deg, transparent 75%, rgba(0,217,255,0.35) 100%)" }} />
                  <div className="absolute w-[85%] h-[1px]" style={{ background: "rgba(0,217,255,0.1)" }} />
                  <div className="absolute h-[85%] w-[1px]" style={{ background: "rgba(0,217,255,0.1)" }} />
                  <div className="absolute w-2 h-2 rounded-full" style={{ background: "#00d9ff", boxShadow: "0 0 8px #00d9ff" }} />
                  <Upload size={20} className="text-cyan-400 relative z-10" style={{ filter: "drop-shadow(0 0 6px rgba(0,217,255,0.5))" }} />
                </div>

                {isDragActive ? (
                  <p className="font-mono text-sm font-bold" style={{ color: "var(--accent-cyan)" }}>
                    RELEASE TO INITIATE SCANNER...
                  </p>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="font-bold text-white text-[15px]">Drop your log file here</p>
                      <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>or click to browse · max 10MB</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                      {LOG_FORMATS.map(fmt => (
                        <span key={fmt.name} className="text-[10px] px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5"
                          style={{ background: `${fmt.color}10`, border: `1px solid ${fmt.color}25`, color: fmt.color }}>
                          {fmt.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Selected File */}
          <AnimatePresence>
            {file && !analyzing && !result && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-center justify-between p-4 rounded-xl border"
                style={{ borderColor: "rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.05)" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <FileText size={16} className="text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-white font-mono truncate">{file.name}</p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {(file.size / 1024).toFixed(1)} KB · Ready for analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button onClick={() => setFile(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                    style={{ color: "var(--text-muted)" }}>
                    <X size={14} />
                  </button>
                  <button onClick={handleAnalyze} className="btn-primary flex items-center gap-2 text-xs py-2 px-4">
                    <Shield size={12} /> Analyze
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis Pipeline */}
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-2 p-6 rounded-xl border relative overflow-hidden"
              style={{ borderColor: "rgba(0,217,255,0.15)", background: "rgba(0,217,255,0.02)" }}>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,217,255,0.05)", border: "1px solid rgba(0,217,255,0.15)" }}>
                <Loader2 size={16} className="animate-spin text-cyan-400" />
              </div>
              <h3 className="text-[13px] font-bold font-heading text-white mb-5 flex items-center gap-2">
                <Activity size={13} className="text-cyan-400 animate-pulse" />
                Running Analysis Pipeline
              </h3>

              {/* Progress bar */}
              <div className="mb-5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #00d9ff, #10ffaa)" }}
                  animate={{ width: `${((activeStep + 1) / scanSteps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }} />
              </div>

              <div className="space-y-4">
                {scanSteps.map((step, idx) => {
                  const isCompleted = idx < activeStep;
                  const isActive = idx === activeStep;
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3.5 transition-all duration-500"
                      style={{ opacity: isCompleted || isActive ? 1 : 0.3 }}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all`}
                        style={{
                          background: isCompleted ? "rgba(16,255,170,0.1)" : isActive ? `${step.color}10` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isCompleted ? "rgba(16,255,170,0.25)" : isActive ? `${step.color}30` : "rgba(255,255,255,0.06)"}`,
                        }}>
                        {isCompleted
                          ? <CheckCircle size={13} className="text-emerald-400" />
                          : isActive
                          ? <Loader2 size={13} className="animate-spin" style={{ color: step.color }} />
                          : <Icon size={13} style={{ color: "var(--text-muted)" }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-mono font-bold" style={{
                          color: isCompleted ? "#10ffaa" : isActive ? step.color : "var(--text-muted)",
                        }}>{step.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
                      </div>
                      {isCompleted && <span className="text-[9px] font-mono text-emerald-400">DONE</span>}
                      {isActive && <span className="text-[9px] font-mono animate-pulse" style={{ color: step.color }}>RUNNING</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 rounded-xl flex items-center gap-3 border"
              style={{ borderColor: "rgba(255,45,85,0.2)", background: "rgba(255,45,85,0.04)" }}>
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-[12px] font-mono text-red-400">{error}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Results ── */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Lines Scanned", value: result.stats.totalLines.toLocaleString(), color: "#00d9ff", icon: FileText },
                { label: "Log Format", value: result.stats.logType.toUpperCase(), color: "#8b5cf6", icon: Cpu },
                { label: "Threats Found", value: result.stats.threatsFound, color: result.stats.threatsFound > 0 ? "#ff2d55" : "#10ffaa", icon: AlertTriangle },
                { label: "Risk Score", value: `${result.stats.riskScore}/100`, color: getRiskColor(result.stats.riskScore), icon: Shield },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="glass-card p-4 text-center" style={{ borderTop: `2px solid ${stat.color}60` }}>
                  <stat.icon size={16} className="mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] uppercase font-mono mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Threats List */}
            {result.stats.threats.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={14} className="text-red-400" />
                    <h2 className="font-bold font-heading text-white text-[15px]">
                      Identified Threats <span style={{ color: "var(--text-muted)" }}>({result.stats.threats.length})</span>
                    </h2>
                  </div>
                  <span className={result.stats.riskScore > 75 ? "badge-critical" : result.stats.riskScore > 45 ? "badge-high" : "badge-medium"}>
                    {getRiskLabel(result.stats.riskScore)}
                  </span>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {result.stats.threats.map((threat, i) => {
                    const sColor = threat.severity === "critical" ? "#ff2d55" : threat.severity === "high" ? "#ff6b35" : "#fbbf24";
                    return (
                      <div key={i} className="px-5 py-4 flex items-center justify-between gap-3 transition-colors hover:bg-white/[0.015]"
                        style={{ borderLeft: `3px solid ${sColor}35` }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${sColor}10`, border: `1px solid ${sColor}25` }}>
                            <AlertTriangle size={13} style={{ color: sColor }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-white font-heading">{threat.title}</p>
                            <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {threat.occurrences} occurrences detected
                            </p>
                          </div>
                        </div>
                        <SevBadge severity={threat.severity} />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="glass-card p-10 text-center" style={{ borderColor: "rgba(16,255,170,0.12)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(16,255,170,0.08)", border: "1px solid rgba(16,255,170,0.2)" }}>
                  <CheckCircle size={24} className="text-emerald-400" />
                </div>
                <p className="font-bold font-heading text-white text-lg">No Threats Detected</p>
                <p className="text-[12px] mt-2" style={{ color: "var(--text-muted)" }}>
                  This log file contains zero signature correlation matches. System appears clean.
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-3">
              {result.reportId && (
                <Link href={`/reports/${result.reportId}`}
                  className="btn-primary flex items-center justify-center gap-2 py-3 text-[13px]">
                  <BarChart2 size={14} /> View Incident Report <ArrowRight size={13} />
                </Link>
              )}
              <button onClick={() => { setFile(null); setResult(null); }}
                className="btn-ghost flex items-center justify-center gap-2 py-3 text-[13px]">
                <Upload size={14} /> Analyze Another File
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Format Info ── */}
      {!result && !analyzing && (
        <motion.div {...fadeUp(0.15)} className="glass-card p-5">
          <h3 className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
            Supported Ingestion Engines
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "Apache Access Log", example: '127.0.0.1 - - [10/Oct] "GET /" 200 2326', color: "#ff6b35" },
              { name: "Nginx Access Log", example: "Combined Log Format (CLF)", color: "#00d9ff" },
              { name: "Linux Syslog", example: "Jun 4 12:00:00 hostname sshd[123]: ...", color: "#8b5cf6" },
              { name: "Auth Log", example: "Failed password for root from 192.168.1.1", color: "#f59e0b" },
              { name: "CSV Logs", example: "ip,timestamp,method,path,status", color: "#10ffaa" },
              { name: "Generic Unstructured", example: "Regex-based pattern extraction", color: "#6366f1" },
            ].map((fmt) => (
              <div key={fmt.name} className="p-3.5 rounded-xl border transition-colors hover:border-white/10"
                style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: fmt.color }} />
                  <p className="text-[12px] font-bold text-white font-heading">{fmt.name}</p>
                </div>
                <p className="text-[10px] font-mono truncate" style={{ color: "var(--text-muted)" }}>{fmt.example}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
