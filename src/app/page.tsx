"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  ExternalLink,
} from "lucide-react";

// Simulated logging ticker lines inside custom security panel visual
const simulatedCorrelatorLines = [
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

function PremiumSecurityVisual() {
  const [tickerLines, setTickerLines] = useState<typeof simulatedCorrelatorLines>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTickerLines((prev) => {
        if (index >= simulatedCorrelatorLines.length) {
          index = 0;
          return [];
        }
        const next = [...prev, simulatedCorrelatorLines[index]];
        index++;
        return next;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative hero-visual-panel bg-[#111827]/60 backdrop-blur-xl border border-white/8 rounded-[6px] overflow-hidden flex flex-col p-5 font-mono select-none shadow-2xl z-10 mx-auto">
      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00E5A8] rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-white tracking-wider">SEC_NODE // CORE_THREAT_CORRELATOR</span>
        </div>
        <span className="text-[9px] text-[#64748B]">STATUS: MONITORED</span>
      </div>

      {/* Grid Layout inside the widget */}
      <div className="flex-grow grid grid-cols-12 gap-3 min-h-0">
        {/* Left Column: Metrics & Analytics Panel */}
        <div className="col-span-4 flex flex-col gap-3 h-full">
          {/* Risk Level gauge */}
          <div className="bg-[#070B14]/85 border border-white/8 p-3 rounded-[4px] flex flex-col justify-between flex-1">
            <span className="text-[9px] text-[#64748B] tracking-wider uppercase font-semibold">Risk Score</span>
            <div className="text-2xl font-bold text-[#EF4444] font-heading tracking-tight mt-1">84%</div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#EF4444] w-[84%] animate-pulse" />
            </div>
            <span className="text-[8px] text-[#EF4444] mt-1.5 uppercase font-bold tracking-wider">// CRITICAL LEVEL</span>
          </div>

          {/* Ingress rate */}
          <div className="bg-[#070B14]/85 border border-white/8 p-3 rounded-[4px] flex flex-col justify-between flex-1">
            <span className="text-[9px] text-[#64748B] tracking-wider uppercase font-semibold">Ingest Ingress</span>
            <div className="text-xl font-bold text-white tracking-tight mt-1">4.2k/s</div>
            <div className="flex gap-1 items-end h-[24px] mt-2">
              {[50, 35, 75, 45, 90, 60, 85, 80].map((h, i) => (
                <div
                  key={i}
                  className="bg-[#00E5A8] opacity-60 w-full rounded-[1px]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Attack Path Visualizer */}
        <div className="col-span-8 bg-[#070B14]/85 border border-white/8 rounded-[4px] relative overflow-hidden p-3 flex flex-col justify-between">
          <span className="text-[9px] text-[#64748B] tracking-wider uppercase font-semibold">// INTRUSION_VECTOR_RADAR</span>

          {/* Attack Path Canvas SVG */}
          <div className="flex-grow relative flex items-center justify-center min-h-[160px]">
            <svg viewBox="0 0 100 80" className="w-full h-full text-white/5 select-none relative z-10">
              {/* Radial radar grid lines */}
              <circle cx="50" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 3" />
              <circle cx="50" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.3" />
              <circle cx="50" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" />

              {/* Connecting Attack Vector Paths */}
              <path d="M 15,20 L 50,40" fill="none" stroke="#EF4444" strokeWidth="0.5" strokeDasharray="1.5 1.5">
                <animate attributeName="stroke-dashoffset" values="10;0" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M 85,25 L 50,40" fill="none" stroke="#F59E0B" strokeWidth="0.5">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
              </path>
              <path d="M 25,65 L 50,40" fill="none" stroke="#22C55E" strokeWidth="0.5" />

              {/* Nodes */}
              <g>
                <circle cx="15" cy="20" r="2" fill="#EF4444" />
                <circle cx="15" cy="20" r="4" fill="none" stroke="#EF4444" strokeWidth="0.3">
                  <animate attributeName="r" values="2;5;2" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>

              <g>
                <circle cx="85" cy="25" r="2" fill="#F59E0B" />
              </g>

              <g>
                <circle cx="25" cy="65" r="2" fill="#22C55E" />
              </g>

              {/* Central Target Node (Gateway) */}
              <g>
                <circle cx="50" cy="40" r="3" fill="#00E5A8" />
                <circle cx="50" cy="40" r="7" fill="none" stroke="#00E5A8" strokeWidth="0.4">
                  <animate attributeName="r" values="3;9;3" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            </svg>

            {/* Labels overlay */}
            <div className="absolute top-2 left-2 right-2 flex justify-between text-[8px] font-mono text-[#94A3B8]">
              <span className="text-[#EF4444] animate-pulse">SQLi: 185.220.101.44</span>
              <span className="text-[#F59E0B]">PROBE: 203.0.113.57</span>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#00E5A8] tracking-widest font-bold bg-[#111827]/95 px-2 py-0.5 border border-[#00E5A8]/20 rounded-[2px] whitespace-nowrap">
              TARGET: API_GATEWAY_NODE
            </div>
          </div>
        </div>
      </div>

      {/* Live Threat Logs ticker at bottom */}
      <div className="h-[100px] border-t border-white/8 mt-4 pt-3 flex flex-col gap-1.5 overflow-hidden min-h-0 text-[10px] text-[#94A3B8]">
        {tickerLines.slice(-3).map((line, i) => {
          let badgeColor = "border-[#64748B] text-[#94A3B8]";
          if (line.type === "danger") badgeColor = "border-[#EF4444] text-[#EF4444]";
          else if (line.type === "warning") badgeColor = "border-[#F59E0B] text-[#F59E0B]";
          else if (line.type === "db") badgeColor = "border-[#00E5A8] text-[#00E5A8]";

          return (
            <div
              key={i}
              className="flex justify-between items-center bg-white/2 py-1 px-2 border-l-2 rounded-[2px]"
              style={{ borderColor: line.type === "danger" ? "#EF4444" : line.type === "warning" ? "#F59E0B" : "#00E5A8" }}
            >
              <span className={`font-bold uppercase tracking-wider text-[8px]`}>{line.type}</span>
              <span className="text-white truncate max-w-[260px] ml-2 font-mono">{line.text}</span>
              <span className="text-[#64748B] text-[9px] font-mono ml-auto">ACTIVE</span>
            </div>
          );
        })}
        {tickerLines.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#64748B] font-mono">
            // CORRELATION_TICKER_OFFLINE
          </div>
        )}
      </div>
    </div>
  );
}

export default function RedesignedLandingPage() {
  return (
    <div className="landing-theme min-h-screen relative overflow-x-hidden selection:bg-[#00E5A8] selection:text-[#070B14]">
      {/* ── Floating Sticky Navigation Bar ────────────────────────────── */}
      <nav className="sticky top-0 left-0 right-0 z-50 h-[64px] bg-[#070B14]/70 backdrop-blur-md border-b border-white/8">
        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-heading font-extrabold text-white text-[20px] tracking-tight">
              THREAT<span className="text-[#00E5A8]">HUNTER</span>
            </span>
          </div>

          {/* Centered navigation links */}
          <div className="hidden md:flex items-center gap-[36px] absolute left-1/2 -translate-x-1/2">
            {[
              { href: "#features", label: "Features" },
              { href: "#demo", label: "Demo" },
              { href: "#docs", label: "Documentation" },
              { href: "https://github.com/Juhamim/threathunder-production", label: "GitHub", external: true },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="text-[13px] font-medium tracking-wide text-[#94A3B8] hover:text-[#00E5A8] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side launch console CTA */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="btn-landing-primary shadow-lg"
              style={{ backgroundColor: "#00E5A8", color: "#070B14", border: "1px solid #00E5A8", height: "38px", padding: "0 18px", fontSize: "13px" }}
            >
              Launch Console
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="container hero relative min-h-[calc(100vh-64px)] pt-[64px] pb-[80px] overflow-hidden">
        {/* Left Side Info Panel */}
        <div className="flex flex-col justify-center gap-[28px] max-w-[640px] w-full relative z-10 text-center lg:text-left mx-auto lg:mx-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#00E5A8] font-bold">
            // Free & Open Source · No Sign-Up Required
          </div>

          <h1 className="text-white tracking-tight leading-[1.1] font-extrabold" style={{ fontSize: "48px", fontFamily: "'Syne', sans-serif" }}>
            Hunt Threats <br className="hidden md:inline" />Before They Hunt You.
          </h1>

          <p className="text-[#94A3B8] leading-[1.6] text-[16px] font-normal max-w-[540px] mx-auto lg:mx-0">
            Detect attacks, leaked secrets, credential abuse, suspicious activity, and security anomalies in seconds using AI-powered threat hunting.
          </p>

          <div className="flex flex-col sm:flex-row gap-[14px] justify-center lg:justify-start w-full">
            <Link
              href="/dashboard"
              className="btn-landing-primary min-w-[190px] justify-center"
              style={{ backgroundColor: "#00E5A8", color: "#070B14", border: "1px solid #00E5A8" }}
            >
              Start Hunting Free
            </Link>
            <a
              href="#demo"
              className="btn-landing-ghost min-w-[150px] justify-center"
              style={{ color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              View Demo
            </a>
            <a
              href="https://github.com/Juhamim/threathunder-production"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-landing-ghost min-w-[180px] justify-center gap-2"
              style={{ color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <svg className="w-4 h-4 fill-current mr-1" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              View Repository
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 mt-2 justify-center lg:justify-start">
            {[
              "Open Source",
              "No Account Required",
              "Privacy First",
              "Local Processing",
              "MIT Licensed",
            ].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#94A3B8] bg-white/2 border border-white/5 px-3 py-1.5 rounded-[2px]"
              >
                <Check size={11} className="text-[#00E5A8]" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side Cybersecurity Visual */}
        <div className="hero-visual">
          <PremiumSecurityVisual />
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────── */}
      <section id="features" className="py-32 border-t border-white/5 bg-[#0D1321]/45">
        <div className="container">
          <div className="mb-20 text-center lg:text-left">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#00E5A8] font-bold">
              // THREAT DETECTION CAPABILITIES
            </span>
            <h2 className="mt-3 text-white font-extrabold" style={{ fontSize: "32px", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>
              What ThreatHunter Does
            </h2>
          </div>

          <div className="features-grid">
            {/* Card 1: AI Log Analysis */}
            <div className="glass-card feature-card bg-[#111827]/50 flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="w-12 h-12 rounded-[4px] flex items-center justify-center mb-6 bg-white/5 border border-white/10">
                  <FileText size={22} className="text-[#00E5A8]" />
                </div>
                <h3 className="font-bold mb-3 text-white" style={{ fontSize: "20px", fontFamily: "'Syne', sans-serif" }}>
                  AI Log Analysis
                </h3>
                <p className="text-[16px] text-[#94A3B8] leading-relaxed">
                  Upload logs and instantly correlate threat signatures. The parser auto-detects fields to scan for SQL Injection, Cross-Site Scripting (XSS), Brute Force, authentication anomalies, and pattern logs, delivering briefs in seconds.
                </p>
              </div>
            </div>

            {/* Card 2: GitHub Secret Scanner */}
            <div className="glass-card feature-card bg-[#111827]/50 flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="w-12 h-12 rounded-[4px] flex items-center justify-center mb-6 bg-white/5 border border-white/10">
                  <Key size={22} className="text-[#00E5A8]" />
                </div>
                <h3 className="font-bold mb-3 text-white" style={{ fontSize: "20px", fontFamily: "'Syne', sans-serif" }}>
                  GitHub Secret Scanner
                </h3>
                <p className="text-[16px] text-[#94A3B8] leading-relaxed">
                  Scan any public or private GitHub repository for exposed API keys, active tokens, credentials, hardcoded passwords, and security misconfigurations across all commit trees and files.
                </p>
              </div>
            </div>

            {/* Card 3: Live Threat Dashboard */}
            <div className="glass-card feature-card bg-[#111827]/50 flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="w-12 h-12 rounded-[4px] flex items-center justify-center mb-6 bg-white/5 border border-white/10">
                  <Shield size={22} className="text-[#00E5A8]" />
                </div>
                <h3 className="font-bold mb-3 text-white" style={{ fontSize: "20px", fontFamily: "'Syne', sans-serif" }}>
                  Live Threat Dashboard
                </h3>
                <p className="text-[16px] text-[#94A3B8] leading-relaxed">
                  Monitor active incidents in real time. Features a tactical attack paths radar, severity categorization (Critical, High, Medium, Low), incident volume trends, and SOC investigation workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ──────────────────────────────────────── */}
      <section id="demo" className="py-32 border-t border-white/5">
        <div className="container">
          <div className="mb-20 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#00E5A8] font-bold">
              // ARCHITECTURAL PIPELINE
            </span>
            <h2 className="mt-3 text-white font-extrabold" style={{ fontSize: "32px", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>
              How It Works
            </h2>
          </div>

          {/* Visual Workflow Steps */}
          <div className="workflow-grid relative items-start">
            {[
              {
                step: "01",
                title: "Upload Logs",
                desc: "Point the ingestion engine at security files or Nginx/Apache/Auth telemetry logs.",
                icon: Terminal,
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Gemini 2.5 Flash tokenizes, classifies, and evaluates anomalies on the records.",
                icon: Cpu,
              },
              {
                step: "03",
                title: "Threat Detection",
                desc: "The heuristics matching system identifies SQLi, XSS, and credential stuffing vectors.",
                icon: Shield,
              },
              {
                step: "04",
                title: "Incident Report",
                desc: "Get an executive SOC briefing complete with indicators of compromise, timeline, and mitigation actions.",
                icon: Activity,
              },
            ].map((node, i) => (
              <div key={node.step} className="relative workflow-card flex flex-col items-center text-center p-6 bg-[#111827]/40 border border-white/5 rounded-[6px] justify-between">
                {/* Arrow connector */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-[18px] z-20 text-[#00E5A8] opacity-30 animate-pulse">
                    <ArrowRight size={20} />
                  </div>
                )}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#00E5A8]/10 border border-[#00E5A8]/30 flex items-center justify-center text-[#00E5A8] text-xs font-mono font-bold mb-4">
                    {node.step}
                  </div>
                  <node.icon size={24} className="text-[#94A3B8] mb-4" />
                  <h3 className="font-bold text-white mb-2" style={{ fontSize: "20px", fontFamily: "'Syne', sans-serif" }}>
                    {node.title}
                  </h3>
                  <p className="text-[14px] text-[#94A3B8] leading-relaxed">
                    {node.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Source Section ────────────────────────────────────────── */}
      <section className="py-32 border-t border-white/5 bg-[#0D1321]/45">
        <div className="container opensource-grid">
          {/* Left Description Column */}
          <div className="space-y-5 text-center lg:text-left">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#00E5A8] font-bold">
              // TRANSPARENT SECURITY
            </span>
            <h2 className="text-white tracking-tight leading-none font-extrabold" style={{ fontSize: "32px", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>
              100% Open Source. <br />Fully Transparent.
            </h2>
            <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed max-w-[580px] mx-auto lg:mx-0">
              ThreatHunter is built in the open by developer <span className="text-white font-bold">Juhamim</span>. Inspect the code, contribute improvements, deploy your own instance, or self-host without vendor lock-in. No trackers, no telemetry metrics leaving your network, and complete control over your keys.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#94A3B8] bg-white/2 border border-white/5 px-3.5 py-1.5 rounded-[2px]">
                <Check size={11} className="text-[#00E5A8]" />
                MIT License
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#94A3B8] bg-white/2 border border-white/5 px-3.5 py-1.5 rounded-[2px]">
                <Check size={11} className="text-[#00E5A8]" />
                Community Driven
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#94A3B8] bg-white/2 border border-white/5 px-3.5 py-1.5 rounded-[2px]">
                <Check size={11} className="text-[#00E5A8]" />
                Privacy First
              </span>
            </div>
          </div>

          {/* Right Repositories Actions widget */}
          <div className="w-full">
            <div className="glass-card bg-[#111827]/60 backdrop-blur-xl space-y-5 w-full repo-card text-left shadow-2xl">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#64748B]">
                <span>MIT CODEBASE</span>
                <span className="text-[#00E5A8] font-bold">Juhamim/threathunder-production</span>
              </div>
              <div className="border-y border-white/5 py-4 flex flex-col gap-2 font-mono text-xs text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Developer</span>
                  <span className="text-white">Juhamim</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact Email</span>
                  <span className="text-white">juhaimmtm@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span>Dependencies</span>
                  <span className="text-white">None (Vanilla / Next.js)</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://github.com/Juhamim/threathunder-production"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-landing-primary w-full justify-center h-10"
                  style={{ backgroundColor: "#00E5A8", color: "#070B14", border: "1px solid #00E5A8" }}
                >
                  GitHub Repository
                </a>
                <Link
                  href="/dashboard"
                  className="btn-landing-ghost w-full justify-center h-10 border-white/8 hover:bg-white/5 text-white"
                >
                  Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ─────────────────────────────────────────── */}
      <section className="py-32 border-t border-white/5 text-center relative overflow-hidden bg-[#070B14]">
        <div className="max-w-[720px] mx-auto px-6 relative z-10">
          <h2 className="text-white font-extrabold tracking-tight font-heading leading-none" style={{ fontSize: "32px", fontFamily: "'Syne', sans-serif" }}>
            Start hunting threats now.
          </h2>
          <p className="text-[#94A3B8] mt-3 font-mono text-xs uppercase tracking-wider">
            Free. Open source. No account required.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/dashboard"
              className="btn-landing-primary min-w-[220px]"
              style={{ backgroundColor: "#00E5A8", color: "#070B14", border: "1px solid #00E5A8" }}
            >
              Launch Console →
            </Link>

            <div className="mt-4 max-w-sm w-full bg-[#111827]/40 border border-white/5 px-4 py-3 rounded-[4px] relative flex items-center justify-center">
              <code className="font-mono text-[11px] text-[#00E5A8] truncate select-all">
                git clone https://github.com/Juhamim/threathunder-production.git
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#070B14] text-[#94A3B8] py-20 relative z-10">
        <div className="container flex flex-col gap-16">
          {/* Main Footer Links */}
          <div className="footer-links-grid text-left">
            <div>
              <span className="font-heading font-extrabold text-white text-[13px] tracking-wider uppercase block mb-4">
                Product
              </span>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li><a href="#features" className="hover:text-[#00E5A8] transition-colors">Features</a></li>
                <li><a href="#demo" className="hover:text-[#00E5A8] transition-colors">Demo</a></li>
                <li><Link href="/dashboard" className="hover:text-[#00E5A8] transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <span className="font-heading font-extrabold text-white text-[13px] tracking-wider uppercase block mb-4">
                Open Source
              </span>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li><a href="https://github.com/Juhamim/threathunder-production" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E5A8] transition-colors">GitHub</a></li>
                <li><span className="text-white/40">MIT License</span></li>
                <li><a href="https://github.com/Juhamim/threathunder-production" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E5A8] transition-colors">Contributing</a></li>
              </ul>
            </div>
            <div>
              <span className="font-heading font-extrabold text-white text-[13px] tracking-wider uppercase block mb-4">
                Community
              </span>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li><a href="https://github.com/Juhamim/threathunder-production/discussions" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E5A8] transition-colors">Discussions</a></li>
                <li><a href="https://github.com/Juhamim/threathunder-production/issues" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E5A8] transition-colors">Issues</a></li>
                <li><a href="https://github.com/Juhamim/threathunder-production/releases" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E5A8] transition-colors">Releases</a></li>
              </ul>
            </div>
            <div>
              <span className="font-heading font-extrabold text-white text-[13px] tracking-wider uppercase block mb-4">
                Company
              </span>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li><span className="text-white/40">About</span></li>
                <li><span className="text-white/40">Contact</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom attribution copyright line */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#64748B] gap-4">
            <div className="flex flex-col items-start gap-1 text-left">
              <span className="font-heading font-extrabold text-white text-[16px]">
                THREAT<span className="text-[#00E5A8]">HUNTER</span>
              </span>
              <span className="text-[10px] text-[#64748B] font-mono">
                Developed by <a href="https://github.com/Juhamim" target="_blank" rel="noopener noreferrer" className="text-[#00E5A8] hover:underline">Juhamim</a>
              </span>
            </div>
            <div className="font-mono text-[11px]">
              © 2026 ThreatHunter. Open-source SOC developed by Juhamim (juhaimmtm@gmail.com).
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
