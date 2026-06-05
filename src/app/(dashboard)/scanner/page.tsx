"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  GitBranch, Search, Shield, AlertTriangle,
  CheckCircle, Loader2, Lock, Eye, Key, Database, ExternalLink,
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

const SEVERITY_ICONS = {
  critical: AlertTriangle,
  high: Eye,
  medium: Key,
};

const EXAMPLE_REPOS = [
  "https://github.com/torvalds/linux",
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>GitHub Security Scanner</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Scan public or private repositories for exposed secrets, API keys, and hardcoded credentials.
        </p>
      </motion.div>

      {/* Scanner Card */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <GitBranch size={20} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Repository Scanner</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Scans up to 150 files per repository</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>
              GitHub Repository URL
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <GitBranch size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  id="repo-url-input"
                  type="url"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleScan()}
                  placeholder="https://github.com/owner/repository"
                  className="cyber-input pl-9"
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
                {scanning ? "Scanning..." : "Scan"}
              </button>
            </div>
          </div>

          {/* Optional Token */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <Lock size={10} />
              GitHub Personal Access Token (optional — required for private repos)
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Example repos */}
          <div>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Try with a public repo:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_REPOS.map(url => (
                <button key={url} onClick={() => setRepoUrl(url)}
                  className="text-xs px-3 py-1 rounded-full transition-all"
                  style={{ background: "rgba(56,189,248,0.1)", color: "var(--accent-cyan)", border: "1px solid rgba(56,189,248,0.2)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(56,189,248,0.1)"}>
                  {url.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scanning progress */}
      {scanning && (
        <motion.div className="glass-card p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 size={36} className="mx-auto mb-4 animate-spin" style={{ color: "#a78bfa" }} />
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>Scanning repository for secrets...</p>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Fetching file tree and analyzing content</p>
          <div className="flex justify-center gap-2 mt-4">
            {["Fetching file tree", "Downloading files", "Running pattern matching"].map((step, i) => (
              <motion.span key={step}
                className="text-xs px-2 py-1 rounded"
                style={{ background: "rgba(139,92,246,0.1)", color: "var(--text-muted)" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}>
                {step}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && !scanning && (
        <div className="glass-card p-4 flex items-center gap-3"
          style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
          <AlertTriangle size={18} style={{ color: "#ef4444" }} />
          <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !scanning && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Summary banner */}
            <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-3"
              style={result.findings.length > 0
                ? { border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }
                : { border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
              <div className="flex items-center gap-3">
                {result.findings.length > 0
                  ? <AlertTriangle size={20} style={{ color: "#ef4444" }} />
                  : <CheckCircle size={20} style={{ color: "#10b981" }} />}
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{result.summary}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Scanned {result.filesScanned} of {result.totalFiles} files in {result.repo}
                  </p>
                </div>
              </div>
              <a href={`https://github.com/${result.repo}`} target="_blank" rel="noopener noreferrer"
                className="btn-ghost text-xs flex items-center gap-1 px-3 py-1.5">
                <ExternalLink size={12} />
                View Repo
              </a>
            </div>

            {/* Stats */}
            {result.findings.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Critical", count: result.stats.critical, color: "#ef4444" },
                  { label: "High", count: result.stats.high, color: "#f97316" },
                  { label: "Medium", count: result.stats.medium, color: "#eab308" },
                ].map(s => (
                  <div key={s.label} className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.count}</div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Findings list */}
            {result.findings.length > 0 && (
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: "rgba(56,189,248,0.1)" }}>
                  <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    Detected Secrets ({result.findings.length})
                  </h2>
                </div>
                <div className="divide-y" style={{ borderColor: "rgba(56,189,248,0.05)" }}>
                  {result.findings.map((finding, i) => {
                    const colors = getSevColor(finding.severity);
                    return (
                      <div key={i} className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`badge-${finding.severity}`}>{finding.severity}</span>
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{finding.type}</span>
                          </div>
                          <div className="text-xs font-mono text-right" style={{ color: "var(--text-muted)" }}>
                            {finding.file}:{finding.line}
                          </div>
                        </div>
                        <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{finding.description}</p>
                        <div className="p-2 rounded font-mono text-xs overflow-x-auto"
                          style={{ background: "rgba(5,10,25,0.8)", border: "1px solid rgba(56,189,248,0.1)", color: "#fb923c" }}>
                          {finding.match}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detection patterns info */}
      <motion.div className="glass-card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          What We Detect
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Key, label: "AWS Access Keys", sev: "critical" },
            { icon: Key, label: "OpenAI/Anthropic Keys", sev: "critical" },
            { icon: Database, label: "Database URLs", sev: "critical" },
            { icon: Lock, label: "Private SSH Keys", sev: "critical" },
            { icon: GitBranch, label: "GitHub Tokens", sev: "critical" },
            { icon: Shield, label: "JWT Secrets", sev: "high" },
            { icon: Key, label: "Stripe API Keys", sev: "critical" },
            { icon: Lock, label: "Generic Passwords", sev: "medium" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg text-xs"
              style={{ background: "rgba(5,10,25,0.5)", border: "1px solid rgba(56,189,248,0.08)" }}>
              <item.icon size={12} style={{ color: item.sev === "critical" ? "#ef4444" : item.sev === "high" ? "#f97316" : "#eab308", flexShrink: 0 }} />
              <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
