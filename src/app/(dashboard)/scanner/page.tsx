"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  GitBranch,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Lock,
  Eye,
  Key,
  Database,
  ExternalLink,
  History,
  FileCode,
} from "lucide-react";

interface FindingSeverity {
  critical: number;
  high: number;
  medium: number;
}

interface Finding {
  type: string;
  severity: "critical" | "high" | "medium";
  file: string;
  line: number;
  match: string;
  description: string;
}

interface ScanResult {
  repo: string;
  filesScanned: number;
  totalFiles: number;
  findings: Finding[];
  summary: string;
  stats: FindingSeverity;
}

interface ScannedHistoryItem {
  repo: string;
  filesScanned: number;
  findingsCount: number;
  stats: FindingSeverity;
  date: string;
}

const EXAMPLE_REPOS = [
  "https://github.com/Juhamim/threathunder-production",
  "https://github.com/expressjs/express",
  "https://github.com/django/django",
];

export default function ScannerPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [history, setHistory] = useState<ScannedHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("threathunter_github_scan_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch { /* skip */ }
    }
  }, []);

  const handleScan = async () => {
    if (!repoUrl.trim()) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scan/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim(), githubToken: githubToken.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      
      setResult(data);

      // Save to scan history
      const historyItem: ScannedHistoryItem = {
        repo: data.repo,
        filesScanned: data.filesScanned,
        findingsCount: data.findings.length,
        stats: data.stats,
        date: new Date().toLocaleDateString(),
      };

      setHistory(prev => {
        const filtered = prev.filter(x => x.repo !== data.repo);
        const updated = [historyItem, ...filtered].slice(0, 5);
        localStorage.setItem("threathunter_github_scan_history", JSON.stringify(updated));
        return updated;
      });

      if (data.findings.length === 0) {
        toast.success("Scan complete — no secrets found!");
      } else {
        toast.warning(`Scan complete — ${data.findings.length} secret(s) detected!`);
      }
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setScanning(false);
    }
  };

  const getSevColor = (sev: string) => {
    if (sev === "critical") return { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#f87171" };
    if (sev === "high") return { bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)", text: "#fb923c" };
    return { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)", text: "#facc15" };
  };

  return (
    <div className="workspace-container overflow-y-auto">
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between h-[60px] border-b border-[#1E2229] pb-3 mb-2">
        <div>
          <h1 className="text-xl font-bold font-heading text-white tracking-tight">GitHub Scanner</h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">Scan public/private codebases for leaked secrets</p>
        </div>
        <div className="flex items-center gap-2">
          <GitBranch size={13} className="text-violet-400 animate-pulse" />
          <span className="font-mono text-[10px] text-violet-400 font-bold uppercase tracking-wider">// SCANNER_ONLINE</span>
        </div>
      </div>

      {/* ── Main Scanner Card ── */}
      <div className="glass-card p-6 flex-shrink-0">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10 border border-violet-500/20">
            <GitBranch size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">Code Analysis Settings</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">Max limit: 150 source files per scan</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Target Input */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B7280] mb-2 block">
              GitHub Repository URL
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <GitBranch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  id="repo-url-input"
                  type="url"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleScan()}
                  placeholder="https://github.com/owner/repository"
                  className="cyber-input pl-10"
                  disabled={scanning}
                />
              </div>
              <button
                id="scan-btn"
                onClick={handleScan}
                disabled={scanning || !repoUrl.trim()}
                className="btn-primary flex items-center gap-2 px-6"
                style={{ opacity: scanning || !repoUrl.trim() ? 0.6 : 1 }}
              >
                {scanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                {scanning ? "Scanning..." : "Initiate Scan"}
              </button>
            </div>
          </div>

          {/* Optional token block */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B7280] mb-2 flex items-center gap-2">
              <Lock size={11} />
              GitHub Personal Access Token (Optional · Required for Private Repos)
            </label>
            <div className="relative">
              <input
                id="github-token-input"
                type={showToken ? "text" : "password"}
                value={githubToken}
                onChange={e => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="cyber-input pr-20"
                disabled={scanning}
              />
              <button
                onClick={() => setShowToken(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-white"
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Quick-select Repo Cards */}
          <div>
            <p className="text-[11px] font-mono text-[#6B7280] mb-2">QUICK SCAN SAMPLES:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {EXAMPLE_REPOS.map(url => (
                <button
                  key={url}
                  onClick={() => setRepoUrl(url)}
                  className="text-left text-xs p-3 rounded-lg border border-white/5 bg-[#0D1117]/30 hover:border-violet-500/30 hover:bg-[#1A1F27] text-[#C8C4BC] hover:text-white transition-all flex items-center justify-between"
                >
                  <span className="truncate">{url.replace("https://github.com/", "")}</span>
                  <ExternalLink size={12} className="text-[#6B7280] flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scanning Progress ── */}
      {scanning && (
        <div className="glass-card p-8 text-center flex-shrink-0">
          <Loader2 size={36} className="mx-auto mb-4 animate-spin text-violet-400" />
          <p className="font-medium text-white">Auditing Repository Commit Trees...</p>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">Parsing files and evaluating secrets signature matrices.</p>
          <div className="flex justify-center gap-2 mt-4">
            {["Fetch Tree", "Ingest Blobs", "Match Signatures"].map((step, i) => (
              <motion.span
                key={step}
                className="text-[10px] font-mono px-2.5 py-1 rounded bg-violet-500/5 text-violet-400 border border-violet-500/10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
              >
                {step}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* ── Error container ── */}
      {error && !scanning && (
        <div className="glass-card p-4 flex items-center gap-3 border-red-500/20 bg-red-500/5 flex-shrink-0">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-xs font-mono text-red-400">{error}</p>
        </div>
      )}

      {/* ── Scan Result Output ── */}
      <AnimatePresence>
        {result && !scanning && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-shrink-0">
            {/* Banner info */}
            <div
              className="glass-card p-4 flex items-center justify-between flex-wrap gap-3 border"
              style={
                result.findings.length > 0
                  ? { borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)" }
                  : { borderColor: "rgba(16,185,129,0.25)", background: "rgba(16,185,129,0.05)" }
              }
            >
              <div className="flex items-center gap-3">
                {result.findings.length > 0 ? (
                  <AlertTriangle size={20} className="text-red-400" />
                ) : (
                  <CheckCircle size={20} className="text-emerald-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{result.summary}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Analyzed {result.filesScanned} of {result.totalFiles} target blobs in {result.repo}
                  </p>
                </div>
              </div>
              <a
                href={`https://github.com/${result.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md"
              >
                <ExternalLink size={12} />
                <span>View Repo</span>
              </a>
            </div>

            {/* Severity stats breakdown cards */}
            {result.findings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Critical Risk", count: result.stats.critical, color: "#ef4444" },
                  { label: "High Risk", count: result.stats.high, color: "#f97316" },
                  { label: "Medium Risk", count: result.stats.medium, color: "#eab308" },
                ].map(s => (
                  <div key={s.label} className="glass-card p-5 text-center flex flex-col justify-center border-t-2" style={{ borderTopColor: `${s.color}80` }}>
                    <div className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.count}</div>
                    <div className="text-[10px] uppercase font-mono mt-1 text-[var(--text-muted)]">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Findings List */}
            {result.findings.length > 0 ? (
              <div className="glass-card p-0 overflow-hidden">
                <div className="p-4 border-b border-[#1E2229]">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode size={15} className="text-violet-400" />
                    <span>Identified Credentials ({result.findings.length})</span>
                  </h2>
                </div>
                <div className="divide-y divide-[#161A20]">
                  {result.findings.map((finding, i) => {
                    const colors = getSevColor(finding.severity);
                    return (
                      <div key={i} className="p-4 transition-colors hover:bg-white/[0.01]" style={{ borderLeft: `3px solid ${colors.text}35` }}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`badge-${finding.severity}`}>{finding.severity}</span>
                            <span className="text-[13px] font-bold text-white">{finding.type}</span>
                          </div>
                          <div className="text-xs font-mono text-[#6B7280]">
                            {finding.file}:{finding.line}
                          </div>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mb-2.5 leading-relaxed">{finding.description}</p>
                        <div
                          className="p-3 rounded-lg font-mono text-xs overflow-x-auto text-[#fb923c]"
                          style={{ background: "rgba(5,10,25,0.9)", border: "1px solid rgba(255,255,255,0.05)" }}
                        >
                          {finding.match}
                        </div>
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
                <p className="font-bold font-heading text-white text-lg">Clean Repository Scan</p>
                <p className="text-[12px] mt-2 text-[var(--text-muted)]">
                  Heuristic matching engine evaluated file tree with zero secrets leaks identified.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scan History Table ── */}
      {!scanning && !result && (
        <motion.div {...fadeUp(0.12)} className="glass-card p-0 overflow-hidden flex-shrink-0">
          <div className="px-5 py-4 border-b flex items-center gap-2.5 border-[#1E2229]">
            <History size={15} className="text-violet-400" />
            <h2 className="font-bold font-heading text-white text-[15px]">Recent Repository Audits</h2>
          </div>

          <div className="overflow-x-auto">
            {history.length === 0 ? (
              <div className="p-12 text-center max-w-sm mx-auto space-y-3">
                <GitBranch size={32} className="text-[#3D4452] mx-auto" />
                <h3 className="text-white font-heading font-semibold text-xs">No scan history available</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Scanned repository details and findings metrics will record here.
                </p>
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs text-[#C8C4BC]">
                <thead>
                  <tr className="bg-[#0D1117] border-b border-[#1E2229] h-[36px] text-[#3D4452] uppercase font-bold tracking-wider">
                    <th className="px-5">Repository</th>
                    <th className="px-5">Date</th>
                    <th className="px-5">Files Scanned</th>
                    <th className="px-5 text-right">Leaks Found</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2229]">
                  {history.map((item) => (
                    <tr key={item.repo} className="h-[44px] hover:bg-[#1A1F27] transition-colors">
                      <td className="px-5 font-bold text-white max-w-[280px] truncate">{item.repo}</td>
                      <td className="px-5 text-[var(--text-muted)]">{item.date}</td>
                      <td className="px-5">{item.filesScanned}</td>
                      <td className="px-5 text-right">
                        <span className={`font-bold ${item.findingsCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                          {item.findingsCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Signature Patterns Widget ── */}
      {!scanning && !result && (
        <motion.div className="glass-card p-5 flex-shrink-0" {...fadeUp(0.18)}>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280] mb-4">
            Monitored Vulnerabilities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Key, label: "AWS Security Keys", sev: "critical" },
              { icon: Key, label: "OpenAI Auth Tokens", sev: "critical" },
              { icon: Database, label: "JDBC Connection strings", sev: "critical" },
              { icon: Lock, label: "SSH Private Keys", sev: "critical" },
              { icon: GitBranch, label: "GitHub PAT Tokens", sev: "critical" },
              { icon: Shield, label: "JSON Web Tokens (JWT)", sev: "high" },
              { icon: Key, label: "Stripe API Signatures", sev: "critical" },
              { icon: Lock, label: "Hardcoded Passwords", sev: "medium" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-[#0D1117]/30 text-xs"
              >
                <item.icon
                  size={14}
                  style={{
                    color: item.sev === "critical" ? "#ef4444" : item.sev === "high" ? "#f97316" : "#eab308",
                    flexShrink: 0,
                  }}
                />
                <span className="text-[#C8C4BC]">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
