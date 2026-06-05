"use client";

import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Eye,
  FileSearch,
  Terminal,
  Globe,
  Lock,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Zap,
  BarChart2,
  MessageSquare,
  GitBranch,
  Star,
  ArrowRight,
  Activity,
  Server,
  Code,
  Key,
} from "lucide-react";

// ─── Floating simulated threat intelligence telemetry ─────────────────────
const simulatedAlerts = [
  { id: 1, ip: "185.220.101.44", type: "SQLi Injection", file: "nginx_access.log", time: "Just now", severity: "critical" },
  { id: 2, ip: "203.0.113.57", type: "SSH Brute Force", file: "auth.log", time: "5s ago", severity: "critical" },
  { id: 3, ip: "github:repository", type: "Exposed AWS Secret", file: "aws_client.go", time: "18s ago", severity: "high" },
  { id: 4, ip: "192.168.1.104", type: "Directory Traversal", file: "apache_error.log", time: "42s ago", severity: "medium" },
];

function InteractiveGlobe() {
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAlertIndex((prev) => (prev + 1) % simulatedAlerts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[380px] lg:h-[450px] flex items-center justify-center overflow-hidden rounded-2xl glass-card border border-cyan-500/10">
      {/* Dynamic Animated Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Rotating 3D Vector Globe SVG */}
      <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex items-center justify-center">
        {/* Radar concentric scanning circles */}
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan-500/10 pointer-events-none"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.05, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[80%] h-[80%] rounded-full border border-emerald-500/10 pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
        />

        {/* Tactical Crosshair */}
        <div className="absolute w-8 h-[1px] bg-cyan-500/30" />
        <div className="absolute h-8 w-[1px] bg-cyan-500/30" />

        {/* Vector Globe SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 select-none">
          {/* Outer Rotating Latitude/Longitude Rings */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {/* Outline */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 217, 255, 0.15)" strokeWidth="0.5" />
            {/* Latitudes */}
            <ellipse cx="50" cy="50" rx="45" ry="12" fill="none" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="0.4" />
            <ellipse cx="50" cy="50" rx="45" ry="25" fill="none" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="0.4" />
            <ellipse cx="50" cy="50" rx="45" ry="38" fill="none" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="0.4" />
            {/* Longitudes */}
            <ellipse cx="50" cy="50" rx="12" ry="45" fill="none" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="0.4" />
            <ellipse cx="50" cy="50" rx="25" ry="45" fill="none" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="0.4" />
            <ellipse cx="50" cy="50" rx="38" ry="45" fill="none" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="0.4" />
          </motion.g>

          {/* Pulse Attack Path Arcs */}
          <motion.path
            d="M 20,30 Q 50,10 80,45"
            fill="none"
            stroke="rgba(255, 59, 92, 0.6)"
            strokeWidth="0.7"
            strokeDasharray="2 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 75,70 Q 40,85 15,40"
            fill="none"
            stroke="rgba(0, 255, 136, 0.6)"
            strokeWidth="0.7"
            strokeDasharray="3 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Pulsing Nodes */}
          {/* North America */}
          <circle cx="20" cy="30" r="1.5" fill="#ff3b5c" />
          <motion.circle cx="20" cy="30" r="4" fill="none" stroke="#ff3b5c" strokeWidth="0.5"
            animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 2, repeat: Infinity }} />

          {/* Europe */}
          <circle cx="50" cy="25" r="1.2" fill="#00d9ff" />

          {/* East Asia */}
          <circle cx="80" cy="45" r="1.5" fill="#00ff88" />
          <motion.circle cx="80" cy="45" r="4" fill="none" stroke="#00ff88" strokeWidth="0.5"
            animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 2.5, repeat: Infinity }} />

          {/* South America */}
          <circle cx="35" cy="70" r="1.2" fill="#ffb800" />
        </svg>
      </div>

      {/* Floating Tactical Telemetry Card Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-20">
        <AnimatePresence mode="wait">
          {simulatedAlerts.map((alert, idx) => {
            if (idx !== activeAlertIndex) return null;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-4 flex items-center justify-between border border-cyan-500/20 shadow-lg shadow-black/80"
                style={{ background: "rgba(10, 10, 10, 0.85)" }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${alert.severity === "critical" ? "bg-red-500 animate-pulse" : "bg-orange-500"}`} />
                  <div>
                    <div className="text-xs font-mono font-bold text-white">{alert.type}</div>
                    <div className="text-[10px] font-mono text-gray-400 mt-0.5">Source: {alert.ip}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-cyan-400">{alert.file}</div>
                  <div className="text-[9px] font-mono text-gray-500 mt-0.5">{alert.time}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Top Left Scanning Telemetry */}
      <div className="absolute top-4 left-4 z-20 font-mono text-[9px] text-cyan-500/50 space-y-1">
        <div>SYS.MONITOR // ONLINE</div>
        <div>RESOLVED_NODES: 124/124</div>
      </div>
    </div>
  );
}

// ─── Feature cards ────────────────────────────────────────────────────────
const features = [
  {
    icon: FileSearch,
    title: "Security Log Parsing",
    description: "Upload Apache, Nginx, Syslog, and Linux auth logs. Autodetect formats and extract key metadata variables instantly.",
    color: "#00d9ff",
    glow: "rgba(0, 217, 255, 0.1)",
  },
  {
    icon: AlertTriangle,
    title: "Pattern Detection Engine",
    description: "Identify brute force, SQL injections, directory traversals, credential stuffing, and unauthorized escalations.",
    color: "#ff3b5c",
    glow: "rgba(255, 59, 92, 0.1)",
  },
  {
    icon: Eye,
    title: "Gemini AI Threat Analyst",
    description: "Gemini 2.5 Flash acts as a tier-1 SOC analyst, explaining threats, root causes, evidence, and remediation steps.",
    color: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.1)",
  },
  {
    icon: BarChart2,
    title: "Command Center Dashboard",
    description: "Inspect log files using beautiful visual trend lines, attack categories, risk scoring gauges, and alert timelines.",
    color: "#00ff88",
    glow: "rgba(0, 255, 136, 0.1)",
  },
  {
    icon: MessageSquare,
    title: "Interactive SOC Chat",
    description: "Ask your personal security analyst anything. Query logs, troubleshoot vulnerabilities, or write custom detection rules.",
    color: "#ffb800",
    glow: "rgba(255, 184, 0, 0.1)",
  },
  {
    icon: GitBranch,
    title: "GitHub Repository Scanner",
    description: "Scan public or private repositories for exposed API tokens, passwords, database credentials, and secret strings.",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.1)",
  },
];

// ─── Steps ────────────────────────────────────────────────────────────────
const steps = [
  { number: "01", title: "Feed Logs", description: "Drag & drop files like Nginx access logs, auth.log, raw CSVs, or unformatted text." },
  { number: "02", title: "Scan Rules", description: "Our engine executes 7 pattern-matching heuristics to detect brute force, SQLi, and traversals." },
  { number: "03", title: "AI Correlation", description: "Gemini correlates matching entries, evaluates attack severity, and writes incident outlines." },
  { number: "04", title: "Export Briefings", description: "Download a structured executive summary PDF containing affected assets, IoCs, and timelines." },
];

// ─── Testimonials ─────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Lead SOC Analyst · CyberShield Inc",
    avatar: "SC",
    content: "ThreatHunter AI cut our initial log triage times by 80%. The AI security explanations are extremely useful for training junior analysts.",
    stars: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Cybersecurity Student · Defend Academy",
    avatar: "MR",
    content: "An absolute goldmine for students. I can feed it real honeypot logs and get immediate, plain-English explanations of how the attack unfolded.",
    stars: 5,
  },
  {
    name: "Alex Kim",
    role: "Penetration Tester · RedTeam Labs",
    avatar: "AK",
    content: "The GitHub scanner flagged exposed dev credentials in a client's public repository before I even began running manual scripts. Outstanding utility.",
    stars: 5,
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────
const faqs = [
  { q: "What log formats are supported?", a: "We support Apache Combined Format, Nginx access logs, Linux Syslog, Linux authentication logs (auth.log), CSV dumps, and generic unstructured text files." },
  { q: "Is my log data sent to external servers?", a: "No. Your log parsing and threat patterns run completely in-browser or locally on your node. Raw logs are only sent to the AI engine for specific intelligence queries, which you control using your own API credentials." },
  { q: "How does the rule engine identify attacks?", a: "We apply 7 security heuristics including failed credential counting, common SQL injection regex patterns, XSS script tag checking, and path traversal strings." },
  { q: "Is the GitHub repository scanner free?", a: "Yes. Public repository scanning works instantly without any authentication. For private repository scans, you can configure your own GitHub Personal Access Token." },
];

export default function LandingPage() {
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSignIn = async () => {
    setLoadingSignIn(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "transparent" }}>
      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(5, 5, 5, 0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0, 217, 255, 0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-cyan-400" />
            <span className="text-lg font-bold font-heading tracking-wide">
              THREAT<span className="text-emerald-400">HUNTER</span> <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-cyan-500/20 text-cyan-400 bg-cyan-950/20">COM_EDITION</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Community", "FAQ"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors font-heading"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="btn-ghost text-xs">Sign In</Link>
            <button onClick={handleSignIn} disabled={loadingSignIn} className="btn-primary text-xs">
              {loadingSignIn ? "Accessing SOC..." : "Launch Console"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center cyber-grid pt-16">
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            {/* Live operational badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-mono"
              style={{ background: "rgba(0, 255, 136, 0.05)", border: "1px solid rgba(0, 255, 136, 0.2)", color: "#00ff88" }}
              animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="status-dot" />
              SYSTEM_MONITOR: RUNNING
            </motion.div>

            <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] mb-6 font-heading tracking-tight">
              See Threats Before <br />
              They Become <span className="gradient-text">Breaches.</span>
            </h1>

            <p className="text-base md:text-lg mb-8 text-gray-400 max-w-lg leading-relaxed">
              AI-powered threat intelligence built for developers, students, and modern security teams.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button onClick={handleSignIn} disabled={loadingSignIn}
                className="btn-primary flex items-center gap-2 text-sm px-6 py-3.5">
                <Terminal size={16} />
                {loadingSignIn ? "Initializing..." : "Start Threat Analysis"}
                <ArrowRight size={14} />
              </button>
              <a href="#how-it-works" className="btn-ghost flex items-center gap-2 text-sm px-6 py-3.5">
                <Activity size={16} className="text-cyan-400" />
                Watch Live Demo
              </a>
            </div>

            {/* Micro details */}
            <div className="flex flex-wrap gap-6 text-xs text-gray-500 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-400" />
                100% Free & MIT Licensed
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-400" />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-400" />
                Self-Hostable Core
              </div>
            </div>
          </motion.div>

          {/* Right — 3D Cyber Globe */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full"
          >
            <InteractiveGlobe />
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="py-24 relative border-t border-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Tactical Modules</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 font-heading tracking-tight">
              Enterprise SOC Capabilities
            </h2>
            <p className="text-sm md:text-base max-w-xl mx-auto mt-3 text-gray-400">
              Ingest, parse, correlate, and analyze log files using modular rule layers and automated Gemini context extraction.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: feature.glow, border: `1px solid ${feature.color}20` }}>
                  <feature.icon size={18} style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-bold mb-2 font-heading text-white">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 relative border-t border-gray-900/50" style={{ background: "rgba(8, 8, 8, 0.4)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">Pipeline Pipeline</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 font-heading tracking-tight">Four Step Ingestion & Triage</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.number} className="relative"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-[1px] z-10"
                    style={{ background: "linear-gradient(90deg, rgba(0,217,255,0.25), transparent)" }} />
                )}
                <div className="glass-card p-6 h-full border border-gray-800/40">
                  <div className="text-4xl font-black mb-4 gradient-text font-mono tracking-tight">{step.number}</div>
                  <h3 className="text-sm font-bold mb-2 font-heading text-white">{step.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="py-24 border-t border-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-mono uppercase tracking-widest text-pink-400">Feedback</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 font-heading tracking-tight">Trusted by Security Professionals</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} className="glass-card p-6 border border-gray-800/40"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={12} fill="#ffb800" style={{ color: "#ffb800" }} />
                  ))}
                </div>
                <p className="text-xs leading-relaxed mb-6 text-gray-300">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #00d9ff, #00ff88)", color: "#050505" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-heading">{t.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community / Free Section (Replaces Pricing) ────────────────── */}
      <section id="community" className="py-24 border-t border-gray-900/50" style={{ background: "rgba(8, 8, 8, 0.4)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">Open Source</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 font-heading tracking-tight">100% Free & Self-Hostable</h2>
            <p className="text-sm max-w-xl mx-auto mt-3 text-gray-400">
              No subscription tiers, no credit cards, and no user limits. Host on your own infrastructure or run fully offline.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Box 1: Local setup */}
            <motion.div
              className="glass-card p-6 border border-cyan-500/10 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-cyan-500/10 border border-cyan-500/20">
                  <Server size={18} className="text-cyan-400" />
                </div>
                <h3 className="text-base font-bold font-heading mb-2">Local Deployment</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Set up the stack locally on your machine in under 2 minutes. Configured to boot using Docker or standard Node processes.
                </p>
              </div>
              <div className="font-mono text-[10px] bg-black/60 p-3 rounded border border-gray-800 text-cyan-400 select-all">
                git clone threathunter-ai<br />
                npm install && npm run dev
              </div>
            </motion.div>

            {/* Box 2: Features */}
            <motion.div
              className="glass-card p-6 border border-emerald-500/10 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            >
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-emerald-500/10 border border-emerald-500/20">
                  <Code size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-base font-bold font-heading mb-2">Community Edition</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Get full access to Nginx/Apache logs parsing, 7+ built-in signature rules, Recharts graphs, and the GitHub scanner.
                </p>
              </div>
              <ul className="space-y-2 mt-6">
                {["Unlimited Ingestion", "Complete Ruleset", "PDF Report Exports"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                    <CheckCircle size={10} className="text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Box 3: Privacy */}
            <motion.div
              className="glass-card p-6 border border-purple-500/10 flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            >
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-purple-500/10 border border-purple-500/20">
                  <Key size={18} className="text-purple-400" />
                </div>
                <h3 className="text-base font-bold font-heading mb-2">Complete Privacy</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Your security logs never touch external developer servers. Configure your own API key to query Gemini 2.5 directly.
                </p>
              </div>
              <button onClick={handleSignIn} className="btn-primary text-xs w-full py-2.5">
                Launch Console
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 border-t border-gray-900/50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Help Center</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 font-heading tracking-tight">Frequently Asked Questions</h2>
          </motion.div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <button className="w-full text-left p-5 flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="text-sm font-semibold font-heading text-white">{faq.q}</span>
                  <ChevronRight size={14} className="text-gray-500" style={{ transform: openFaq === i ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs leading-relaxed text-gray-400 border-t border-gray-900/30 pt-3">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden border-t border-gray-900/50" style={{ background: "rgba(8, 8, 8, 0.4)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black mb-6 font-heading tracking-tight">
              Launch Your Security <br />
              <span className="gradient-text">Command Center.</span>
            </h2>
            <p className="text-sm md:text-base mb-8 text-gray-400 max-w-md mx-auto leading-relaxed">
              Analyze logs, identify vulnerability patterns, and generate professional incident summaries today.
            </p>
            <button onClick={handleSignIn} disabled={loadingSignIn}
              className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-3 justify-center w-fit mx-auto">
              <Shield size={16} />
              {loadingSignIn ? "Initializing..." : "Launch Console Free"}
              <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-900/50" style={{ background: "rgba(5, 5, 5, 0.95)" }}>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-cyan-400" />
            <span className="font-bold font-heading text-sm text-white">THREAT<span className="text-emerald-400">HUNTER</span></span>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            © 2026 ThreatHunter AI. MIT Licensed. Created for the global developer community.
          </div>
          <div className="flex gap-6 text-xs text-gray-500 font-mono">
            <a href="https://github.com/google/threathunter-ai" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
