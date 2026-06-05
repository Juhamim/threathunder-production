"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, FileText, AlertTriangle, Shield, CheckCircle,
  X, Loader2, ChevronRight, BarChart2, ArrowRight,
  Activity, Server, Database, Brain,
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

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

const scanSteps = [
  { label: "Analyzing Logs...", desc: "Detecting log type and parsing records", icon: Server },
  { label: "Correlating Security Events...", desc: "Mapping sessions, timestamps and IP routes", icon: Database },
  { label: "Running Detection Engine...", desc: "Evaluating heuristic patterns and rule flags", icon: Shield },
  { label: "Generating Threat Intelligence...", desc: "Summarizing incidents with Gemini 2.5 Flash", icon: Brain },
];

function SevBadge({ severity }: { severity: string }) {
  return <span className={`badge-${severity}`}>{severity}</span>;
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
        setActiveStep((prev) => {
          if (prev < scanSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 1500);
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
    onDropRejected: () => toast.error("File rejected. Max 10MB, text/log/csv formats only."),
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

      // Give a tiny delay for user experience if it returns instantly
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult(data);
      toast.success(`Analysis complete! ${data.stats.threatsFound} threat(s) detected.`);
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 75) return "#ff3b5c"; // critical
    if (score > 45) return "#ff8800"; // high
    if (score > 25) return "#ffb800"; // medium
    return "#00ff88"; // low/emerald
  };

  const getRiskLabel = (score: number) => {
    if (score > 75) return "Critical Risk";
    if (score > 45) return "High Risk";
    if (score > 25) return "Moderate Risk";
    return "Secure";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-heading text-white">Log Analysis Console</h1>
        <p className="text-xs font-mono mt-1 text-gray-400">
          SEC.DEV // LOG_INGESTION // TARGET: UNKNOWN_LOGS
        </p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h2 className="text-sm font-bold font-heading text-white mb-4">Ingest Telemetry File</h2>

        {!analyzing && !result && (
          <div
            {...getRootProps()}
            className={`drop-zone ${isDragActive ? "active" : ""}`}
            style={{ cursor: "pointer" }}
          >
            <input {...getInputProps()} id="log-file-input" />
            <div className="flex flex-col items-center gap-3">
              {/* Custom Radar Sweep Animation */}
              <div className="relative w-20 h-20 mx-auto mb-2 border border-cyan-500/25 rounded-full overflow-hidden flex items-center justify-center bg-cyan-950/10">
                {/* RadarSweep line */}
                <div 
                  className="absolute inset-0 origin-center" 
                  style={{ 
                    animation: 'spin 3s linear infinite', 
                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(0, 217, 255, 0.3) 100%)' 
                  }} 
                />
                <div className="absolute w-[80%] h-[1px] bg-cyan-500/10" />
                <div className="absolute h-[80%] w-[1px] bg-cyan-500/10" />
                <Upload size={22} className="text-cyan-400 relative z-10" />
              </div>

              {isDragActive ? (
                <p className="text-cyan-400 font-mono text-xs">RELEASE FILE TO START SCANNER...</p>
              ) : (
                <>
                  <div>
                    <p className="font-semibold text-sm text-white">Drag & drop your log file here</p>
                    <p className="text-xs mt-1 text-gray-500">or click to browse files</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Apache", "Nginx", "Syslog", "auth.log", "CSV", "TXT"].map(fmt => (
                      <span key={fmt} className="text-[10px] px-2 py-0.5 rounded font-mono border border-cyan-500/10 text-cyan-400 bg-cyan-950/20">
                        {fmt}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">MAX FILE SIZE: 10MB</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Selected file confirmation */}
        <AnimatePresence>
          {file && !analyzing && !result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center justify-between p-4 rounded-lg border border-cyan-500/20 bg-cyan-950/5"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-cyan-400" />
                <div>
                  <p className="text-xs font-mono font-bold text-white">{file.name}</p>
                  <p className="text-[10px] font-mono text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setFile(null)} className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
                <button onClick={handleAnalyze} className="btn-primary flex items-center gap-2 text-xs py-2 px-4">
                  <Shield size={12} />
                  Initiate Triage
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyzing / Scanning State */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 p-6 rounded-lg border border-cyan-500/25 bg-cyan-950/5 relative overflow-hidden"
          >
            {/* Spinning background radar sweeper */}
            <div className="absolute top-4 right-4 w-12 h-12 border border-cyan-500/10 rounded-full flex items-center justify-center bg-cyan-950/10 pointer-events-none">
              <Loader2 size={16} className="animate-spin text-cyan-400" />
            </div>

            <h3 className="text-sm font-bold font-heading text-white mb-6 flex items-center gap-2">
              <Activity size={14} className="text-cyan-400 animate-pulse" />
              Running Analysis Pipeline...
            </h3>

            {/* Sequential Steps Loader list */}
            <div className="space-y-4 max-w-md">
              {scanSteps.map((step, idx) => {
                const isCompleted = idx < activeStep;
                const isActive = idx === activeStep;
                const Icon = step.icon;

                return (
                  <div key={idx} className="flex items-start gap-3 transition-opacity duration-300" style={{ opacity: isCompleted || isActive ? 1 : 0.35 }}>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border flex-shrink-0 ${
                      isCompleted 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                        : isActive 
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                        : "bg-gray-900 border-gray-800 text-gray-500"
                    }`}>
                      {isCompleted ? <CheckCircle size={12} /> : isActive ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
                    </div>
                    <div>
                      <p className={`text-xs font-mono font-bold ${isActive ? "text-cyan-400" : isCompleted ? "text-emerald-400" : "text-gray-500"}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-4 rounded-lg flex items-center gap-2 border border-red-500/20 bg-red-950/5">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-xs font-mono text-red-400">{error}</p>
          </div>
        )}
      </motion.div>

      {/* Results output */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Lines Scanned", value: result.stats.totalLines.toLocaleString(), color: "#00d9ff" },
                { label: "Detected Format", value: result.stats.logType.toUpperCase(), color: "#8b5cf6" },
                { label: "Threat Events", value: result.stats.threatsFound, color: result.stats.threatsFound > 0 ? "#ff3b5c" : "#00ff88" },
                { label: "Risk Score Rating", value: `${result.stats.riskScore}/100`, color: getRiskColor(result.stats.riskScore) },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[10px] uppercase font-mono mt-1 text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Threats log */}
            {result.stats.threats.length > 0 ? (
              <div className="glass-card">
                <div className="p-4 border-b border-gray-900/50 flex items-center justify-between">
                  <h2 className="text-sm font-bold font-heading flex items-center gap-2 text-white">
                    <AlertTriangle size={16} className="text-red-500" />
                    Identified Threats ({result.stats.threats.length})
                  </h2>
                  <span className={result.stats.riskScore > 75 ? "badge-critical" : result.stats.riskScore > 45 ? "badge-high" : "badge-medium"}>
                    {getRiskLabel(result.stats.riskScore)}
                  </span>
                </div>
                <div className="divide-y divide-gray-900/40">
                  {result.stats.threats.map((threat, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={14} style={{ color: threat.severity === "critical" ? "#ff3b5c" : threat.severity === "high" ? "#ff8800" : "#ffb800" }} />
                        <div>
                          <p className="text-xs font-bold text-white font-mono">{threat.title}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{threat.occurrences} instances identified</p>
                        </div>
                      </div>
                      <SevBadge severity={threat.severity} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 text-center border border-emerald-500/10">
                <CheckCircle size={36} className="mx-auto mb-3 text-emerald-400" />
                <p className="font-bold font-heading text-white">No Threat Matches Found</p>
                <p className="text-xs text-gray-500 mt-1">This log file contains zero signature correlation matches.</p>
              </div>
            )}

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-3">
              {result.reportId && (
                <Link href={`/reports/${result.reportId}`}
                  className="btn-primary flex items-center justify-center gap-2 py-3">
                  <BarChart2 size={14} />
                  View Incident Briefing
                  <ArrowRight size={14} />
                </Link>
              )}
              <button
                onClick={() => { setFile(null); setResult(null); }}
                className="btn-ghost flex items-center justify-center gap-2">
                <Upload size={14} />
                Analyze Another File
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supported formats info */}
      {!result && !analyzing && (
        <motion.div className="glass-card p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-3">Supported Ingestion Engines</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "Apache Access Log", example: '127.0.0.1 - - [10/Oct/2000] "GET /" 200' },
              { name: "Nginx Access Log", example: 'Identical to Combined common format' },
              { name: "Linux Syslog", example: 'Jun 4 12:00:00 hostname sshd: Failed password...' },
              { name: "Auth Log", example: 'Failed password for root from 192.168.1.1' },
              { name: "CSV Logs", example: 'ip,timestamp,method,path,status' },
              { name: "Generic Unstructured", example: 'Regex search on common parameters' },
            ].map((fmt) => (
              <div key={fmt.name} className="p-3 rounded-lg border border-gray-900 bg-black/30">
                <p className="text-xs font-bold text-gray-300 font-heading">{fmt.name}</p>
                <p className="text-[9px] mt-1 font-mono text-gray-600 truncate">{fmt.example}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
