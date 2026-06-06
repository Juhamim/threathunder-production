"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Key,
  FileText,
  Check,
  Activity,
  Terminal,
  ArrowRight,
  Cpu,
  Code,
} from "lucide-react";

/* ── Ticker data ────────────────────────────────────────────────────────── */
const correlatorLines = [
  { text: "sys.telemetry_ingest: listening on socket :8080...", type: "system" },
  { text: "parser.nginx: mapping combined log format variables...", type: "system" },
  { text: "event.correlation: established database engine session...", type: "db" },
  { text: "engine.signature: loaded 7 threat patterns successfully", type: "system" },
  { text: "CRITICAL: SQLi attempt detected from IP 185.220.101.44 (nginx_access.log)", type: "danger" },
  { text: "   --> evidence payload: GET /index.php?id=1%27%20UNION%20SELECT...", type: "evidence" },
  { text: "WARNING: SSH brute force alert from IP 203.0.113.57 (auth.log)", type: "warning" },
  { text: "   --> occurrences: 42 authentication failures in 5s", type: "evidence" },
  { text: "engine.scanner: checking repository github.com/Juhamim/threathunder-production...", type: "system" },
  { text: "CRITICAL: Exposed API key found in config/jwt.json (commit cd4590f)", type: "danger" },
  { text: "   --> pattern: AWS ACCESS KEY (AKIAIOSFODNN7EXAMPLE)", type: "evidence" },
  { text: "telemetry.status: 2 incidents flagged. Console ready.", type: "db" },
];

/* ── Security Visual Component ──────────────────────────────────────────── */
function PremiumSecurityVisual() {
  const [tickerLines, setTickerLines] = useState<typeof correlatorLines>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTickerLines((prev) => {
        if (index >= correlatorLines.length) { index = 0; return []; }
        const next = [...prev, correlatorLines[index]];
        index++;
        return next;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-visual-panel bg-[#111827]/60 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden flex flex-col p-5 font-mono select-none shadow-2xl">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00E5A8] rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-white tracking-wider">
            SEC_NODE // CORE_THREAT_CORRELATOR
          </span>
        </div>
        <span className="text-[9px] text-[#64748B]">STATUS: MONITORED</span>
      </div>

      {/* Metrics + Radar grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left: metric tiles */}
        <div className="col-span-4 flex flex-col gap-3">
          {/* Risk gauge */}
          <div className="bg-[#070B14]/85 border border-white/8 p-3 rounded-lg flex flex-col justify-between flex-1">
            <span className="text-[9px] text-[#64748B] tracking-wider uppercase font-semibold">Risk Score</span>
            <div className="text-2xl font-bold text-[#EF4444] tracking-tight mt-1">84%</div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#EF4444] w-[84%] animate-pulse" />
            </div>
            <span className="text-[8px] text-[#EF4444] mt-1.5 uppercase font-bold tracking-wider">// CRITICAL</span>
          </div>

          {/* Ingress rate */}
          <div className="bg-[#070B14]/85 border border-white/8 p-3 rounded-lg flex flex-col justify-between flex-1">
            <span className="text-[9px] text-[#64748B] tracking-wider uppercase font-semibold">Ingest Rate</span>
            <div className="text-xl font-bold text-white tracking-tight mt-1">4.2k/s</div>
            <div className="flex gap-[2px] items-end h-6 mt-2">
              {[50, 35, 75, 45, 90, 60, 85, 80].map((h, i) => (
                <div
                  key={i}
                  className="bg-[#00E5A8] opacity-60 flex-1 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: attack path radar */}
        <div className="col-span-8 bg-[#070B14]/85 border border-white/8 rounded-lg relative overflow-hidden p-3 flex flex-col justify-between">
          <span className="text-[9px] text-[#64748B] tracking-wider uppercase font-semibold mb-2">
            // INTRUSION_VECTOR_RADAR
          </span>
          <div className="flex-1 relative flex items-center justify-center min-h-[140px]">
            <svg viewBox="0 0 100 80" className="w-full h-full text-white/5 select-none">
              <circle cx="50" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 3" />
              <circle cx="50" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.3" />
              <circle cx="50" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" />
              <path d="M 15,20 L 50,40" fill="none" stroke="#EF4444" strokeWidth="0.5" strokeDasharray="1.5 1.5">
                <animate attributeName="stroke-dashoffset" values="10;0" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 85,25 L 50,40" fill="none" stroke="#F59E0B" strokeWidth="0.5">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
              </path>
              <path d="M 25,65 L 50,40" fill="none" stroke="#22C55E" strokeWidth="0.5" />
              <g>
                <circle cx="15" cy="20" r="2" fill="#EF4444" />
                <circle cx="15" cy="20" r="4" fill="none" stroke="#EF4444" strokeWidth="0.3">
                  <animate attributeName="r" values="2;5;2" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
              <g><circle cx="85" cy="25" r="2" fill="#F59E0B" /></g>
              <g><circle cx="25" cy="65" r="2" fill="#22C55E" /></g>
              <g>
                <circle cx="50" cy="40" r="3" fill="#00E5A8" />
                <circle cx="50" cy="40" r="7" fill="none" stroke="#00E5A8" strokeWidth="0.4">
                  <animate attributeName="r" values="3;9;3" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            </svg>

            <div className="absolute top-1 left-2 right-2 flex justify-between text-[8px] font-mono text-[#94A3B8]">
              <span className="text-[#EF4444] animate-pulse">SQLi: 185.220.101.44</span>
              <span className="text-[#F59E0B]">PROBE: 203.0.113.57</span>
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#00E5A8] tracking-widest font-bold bg-[#111827]/95 px-2 py-0.5 border border-[#00E5A8]/20 rounded whitespace-nowrap">
              TARGET: API_GATEWAY_NODE
            </div>
          </div>
        </div>
      </div>

      {/* Live threat log ticker */}
      <div className="h-[90px] border-t border-white/8 mt-4 pt-3 flex flex-col gap-1.5 overflow-hidden flex-shrink-0 text-[10px] text-[#94A3B8]">
        {tickerLines.slice(-3).map((line, i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-1 px-2 border-l-2 rounded-sm bg-white/2"
            style={{
              borderColor:
                line.type === "danger" ? "#EF4444" :
                line.type === "warning" ? "#F59E0B" : "#00E5A8",
            }}
          >
            <span
              className="font-bold uppercase tracking-wider text-[8px] w-14 flex-shrink-0"
              style={{
                color:
                  line.type === "danger" ? "#EF4444" :
                  line.type === "warning" ? "#F59E0B" :
                  line.type === "db" ? "#00E5A8" : "#64748B",
              }}
            >
              {line.type}
            </span>
            <span className="text-white truncate font-mono text-[9px]">{line.text}</span>
          </div>
        ))}
        {tickerLines.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#64748B] font-mono text-[10px]">
            // CORRELATION_TICKER_OFFLINE
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="landing-theme min-h-screen selection:bg-[#00E5A8] selection:text-[#070B14]">

      {/* ══ Navigation ══════════════════════════════════════════════════════ */}
      <nav
        className="sticky top-0 left-0 right-0 z-50 h-16 backdrop-blur-md border-b"
        style={{ backgroundColor: "rgba(7,11,20,0.75)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="container h-full flex items-center justify-between">
          {/* Logo */}
          <span className="font-heading font-extrabold text-white text-[20px] tracking-tight flex-shrink-0">
            THREAT<span className="text-[#00E5A8]">HUNTER</span>
          </span>

          {/* Centered nav links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {[
              { href: "#features",  label: "Features" },
              { href: "#demo",      label: "Demo" },
              { href: "#docs",      label: "Documentation" },
              { href: "https://github.com/Juhamim/threathunder-production", label: "GitHub", external: true },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="text-[13px] font-medium text-[#94A3B8] hover:text-[#00E5A8] transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="btn-landing-primary flex-shrink-0"
            style={{ fontSize: "13px", height: "38px", padding: "0 16px" }}
          >
            Launch Console
          </Link>
        </div>
      </nav>

      {/* ══ Hero ════════════════════════════════════════════════════════════ */}
      <section
        className="container hero"
        style={{ paddingTop: "80px", paddingBottom: "96px" }}
      >
        {/* Left: copy */}
        <div className="flex flex-col gap-7 relative z-10 text-center lg:text-left mx-auto lg:mx-0 max-w-[620px] w-full">
          {/* Eyebrow */}
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00E5A8] font-bold">
            // Free &amp; Open Source · No Sign-Up Required
          </p>

          {/* Headline */}
          <h1
            className="text-white tracking-tight leading-[1.08] font-extrabold"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Hunt Threats <br className="hidden md:inline" />Before They Hunt You.
          </h1>

          {/* Subheading */}
          <p
            className="leading-[1.65] font-normal max-w-[520px] mx-auto lg:mx-0"
            style={{ color: "#94A3B8", fontSize: "16px" }}
          >
            Detect attacks, leaked secrets, credential abuse, suspicious activity, and security anomalies in seconds using AI-powered threat hunting.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              href="/dashboard"
              className="btn-landing-primary"
              style={{ minWidth: "180px" }}
            >
              Start Hunting Free
            </Link>
            <a
              href="#demo"
              className="btn-landing-ghost"
              style={{ minWidth: "130px" }}
            >
              View Demo
            </a>
            <a
              href="https://github.com/Juhamim/threathunder-production"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-landing-ghost"
              style={{ minWidth: "160px" }}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              View Repository
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {["Open Source", "No Account Required", "Privacy First", "Local Processing", "MIT Licensed"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#94A3B8] border px-3 py-1.5 rounded"
                style={{ fontSize: "11px", background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
              >
                <Check size={10} className="text-[#00E5A8] flex-shrink-0" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Right: security visual */}
        <div className="hero-visual">
          <PremiumSecurityVisual />
        </div>
      </section>

      {/* ══ Features ════════════════════════════════════════════════════════ */}
      <section
        id="features"
        className="landing-section border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(13,19,33,0.5)" }}
      >
        <div className="container">
          {/* Section header */}
          <div className="section-intro text-center">
            <span className="section-label">// THREAT DETECTION CAPABILITIES</span>
            <h2 className="text-white font-extrabold">What ThreatHunter Does</h2>
          </div>

          {/* Cards */}
          <div className="features-grid">
            {[
              {
                icon: FileText,
                title: "AI Log Analysis",
                desc: "Upload logs and instantly correlate threat signatures. The parser auto-detects fields to scan for SQL Injection, XSS, Brute Force, authentication anomalies, and pattern logs, delivering briefings in seconds.",
              },
              {
                icon: Key,
                title: "GitHub Secret Scanner",
                desc: "Scan any public or private GitHub repository for exposed API keys, active tokens, credentials, hardcoded passwords, and security misconfigurations across all commit trees and files.",
              },
              {
                icon: Shield,
                title: "Live Threat Dashboard",
                desc: "Monitor active incidents in real time. Features a tactical attack paths radar, severity categorization (Critical, High, Medium, Low), incident volume trends, and SOC investigation workflows.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="glass-card feature-card"
                style={{ background: "rgba(17,24,39,0.5)" }}
              >
                <div className="card-icon">
                  <Icon size={22} className="text-[#00E5A8]" />
                </div>
                <h3 className="text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {title}
                </h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ How It Works ════════════════════════════════════════════════════ */}
      <section
        id="demo"
        className="landing-section border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="container">
          {/* Section header */}
          <div className="section-intro text-center">
            <span className="section-label">// ARCHITECTURAL PIPELINE</span>
            <h2 className="text-white font-extrabold">How It Works</h2>
          </div>

          {/* Workflow steps */}
          <div className="workflow-grid">
            {[
              { step: "01", title: "Upload Logs",     desc: "Point the ingestion engine at security files or Nginx/Apache/Auth telemetry logs.", icon: Terminal },
              { step: "02", title: "AI Analysis",     desc: "Gemini 2.5 Flash tokenizes, classifies, and evaluates anomalies on the records.", icon: Cpu },
              { step: "03", title: "Threat Detection", desc: "The heuristics matching system identifies SQLi, XSS, and credential stuffing vectors.", icon: Shield },
              { step: "04", title: "Incident Report", desc: "Get an executive SOC briefing with indicators of compromise, timeline, and mitigation actions.", icon: Activity },
            ].map((node, i) => (
              <div key={node.step} className="workflow-card">
                {/* Arrow connector */}
                {i < 3 && (
                  <div className="workflow-connector">
                    <ArrowRight size={18} />
                  </div>
                )}

                <div className="step-badge">{node.step}</div>
                <node.icon size={24} className="text-[#94A3B8]" />
                <h3 className="text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {node.title}
                </h3>
                <p>{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Open Source ═════════════════════════════════════════════════════ */}
      <section
        className="landing-section border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(13,19,33,0.5)" }}
      >
        <div className="container opensource-grid">
          {/* Left: description */}
          <div className="space-y-6 text-center lg:text-left">
            <div>
              <span className="section-label">// TRANSPARENT SECURITY</span>
              <h2
                className="text-white tracking-tight leading-none font-extrabold mt-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                100% Open Source.<br />Fully Transparent.
              </h2>
            </div>

            <p className="leading-relaxed max-w-[540px] mx-auto lg:mx-0" style={{ color: "#94A3B8", fontSize: "16px" }}>
              ThreatHunter is built in the open by developer{" "}
              <span className="text-white font-bold">Juhamim</span>. Inspect the code, contribute
              improvements, deploy your own instance, or self-host without vendor lock-in. No
              trackers, no telemetry leaving your network, and complete control over your keys.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {["MIT License", "Community Driven", "Privacy First"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#94A3B8] border px-3.5 py-1.5 rounded"
                  style={{ fontSize: "11px", background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <Check size={10} className="text-[#00E5A8] flex-shrink-0" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right: repo card */}
          <div className="w-full">
            <div
              className="glass-card space-y-5 w-full text-left shadow-2xl"
              style={{ background: "rgba(17,24,39,0.65)" }}
            >
              <div className="flex items-center justify-between font-mono text-[10px] text-[#64748B]">
                <span>MIT CODEBASE</span>
                <span className="text-[#00E5A8] font-bold">Juhamim/threathunder-production</span>
              </div>

              <div className="border-y border-white/5 py-4 flex flex-col gap-2.5 font-mono text-xs text-[#94A3B8]">
                {[
                  ["Developer",       "Juhamim"],
                  ["Contact Email",   "juhaimmtm@gmail.com"],
                  ["License",         "MIT Open Source"],
                  ["Dependencies",    "Next.js 15 / Tailwind CSS"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-[#64748B]">{k}</span>
                    <span className="text-white font-semibold">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://github.com/Juhamim/threathunder-production"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-landing-primary w-full justify-center"
                >
                  GitHub Repository
                </a>
                <Link
                  href="/dashboard"
                  className="btn-landing-ghost w-full justify-center"
                >
                  Launch Console
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Final CTA ═══════════════════════════════════════════════════════ */}
      <section
        className="landing-section border-t text-center relative overflow-hidden"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "#070B14" }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,229,168,0.07), transparent)",
          }}
        />
        <div className="container relative z-10">
          <div className="max-w-[640px] mx-auto flex flex-col items-center gap-8">
            <div className="space-y-4">
              <h2
                className="text-white font-extrabold tracking-tight leading-none"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Start hunting threats now.
              </h2>
              <p className="text-[#94A3B8] font-mono text-xs uppercase tracking-wider">
                Free. Open source. No account required.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 w-full max-w-sm">
              <Link
                href="/dashboard"
                className="btn-landing-primary w-full justify-center"
              >
                Launch Console →
              </Link>

              <div
                className="w-full border px-4 py-3 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(17,24,39,0.5)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <code className="font-mono text-[11px] text-[#00E5A8] select-all truncate">
                  git clone https://github.com/Juhamim/threathunder-production.git
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Footer ══════════════════════════════════════════════════════════ */}
      <footer
        className="border-t py-20 relative z-10"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          background: "#070B14",
          color: "#94A3B8",
        }}
      >
        <div className="container flex flex-col gap-16">
          {/* Link columns */}
          <div className="footer-links-grid text-left">
            {[
              {
                title: "Product",
                links: [
                  { label: "Features",      href: "#features" },
                  { label: "Demo",          href: "#demo" },
                  { label: "Documentation", href: "/dashboard" },
                ],
              },
              {
                title: "Open Source",
                links: [
                  { label: "GitHub",      href: "https://github.com/Juhamim/threathunder-production", external: true },
                  { label: "MIT License", href: "#" },
                  { label: "Contributing", href: "https://github.com/Juhamim/threathunder-production", external: true },
                ],
              },
              {
                title: "Community",
                links: [
                  { label: "Discussions", href: "https://github.com/Juhamim/threathunder-production/discussions", external: true },
                  { label: "Issues",      href: "https://github.com/Juhamim/threathunder-production/issues", external: true },
                  { label: "Releases",    href: "https://github.com/Juhamim/threathunder-production/releases", external: true },
                ],
              },
              {
                title: "Developer",
                links: [
                  { label: "Juhamim", href: "https://github.com/Juhamim", external: true },
                  { label: "juhaimmtm@gmail.com", href: "mailto:juhaimmtm@gmail.com" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <span
                  className="font-heading font-extrabold text-white uppercase block mb-5"
                  style={{ fontSize: "12px", letterSpacing: "0.1em" }}
                >
                  {col.title}
                </span>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={(link as any).external ? "_blank" : undefined}
                        rel={(link as any).external ? "noopener noreferrer" : undefined}
                        className="text-[#64748B] hover:text-[#00E5A8] transition-colors text-xs font-medium"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-heading font-extrabold text-white text-[18px]">
                THREAT<span className="text-[#00E5A8]">HUNTER</span>
              </span>
              <span className="text-[11px] text-[#64748B] font-mono">
                Developed by{" "}
                <a
                  href="https://github.com/Juhamim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00E5A8] hover:underline"
                >
                  Juhamim
                </a>
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#64748B]">
              © 2026 ThreatHunter — Open-source SOC platform by Juhamim (juhaimmtm@gmail.com).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
