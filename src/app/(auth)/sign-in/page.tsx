"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Shield, Key, RefreshCw, Lock, Activity } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [loadingSandbox, setLoadingSandbox] = useState(false);
  const [email, setEmail] = useState("");
  const [analystKey, setAnalystKey] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setLoading(false);
    }
  };

  const handleSandboxSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSandbox(true);
    try {
      await signIn("credentials", { callbackUrl: "/dashboard" });
    } catch {
      setLoadingSandbox(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden text-[var(--text-primary)]"
      style={{ background: "var(--bg-void)" }}
    >
      {/* Ambient background dots */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="radial-glow" />

      {/* Sign-in Card */}
      <motion.div
        className="glass-card w-full mx-4 relative z-10 p-6 sm:p-8 md:p-10"
        style={{
          boxShadow: "none",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo block */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div
              className="w-16 h-16 rounded-[4px] flex items-center justify-center relative bg-[var(--bg-surface)] border border-[var(--border-color)]"
            >
              <Shield size={24} className="text-[var(--accent-mint)]" />
            </div>
          </div>

          <h1 className="text-xl font-heading font-bold text-white tracking-wide">
            THREAT<span className="text-[var(--accent-mint)]">HUNTER</span>
          </h1>
          <p className="font-mono text-[11px] tracking-widest text-[var(--text-muted)] mt-1">
            AI SECURITY PLATFORM
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold font-heading text-white">Console Authentication</h2>
          <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1">
            Establish secure session to access SOC platform
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSandboxSignIn} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
              Analyst Email Address
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@threathunter.ai"
              className="cyber-input font-mono text-sm block w-full outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-mono font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
              Bypass / Authorization Key
            </label>
            <input
              id="auth-key-input"
              type="password"
              value={analystKey}
              onChange={(e) => setAnalystKey(e.target.value)}
              placeholder="••••••••"
              className="cyber-input font-mono text-sm block w-full outline-none transition-all"
              required
            />
          </div>

          {/* Submit Sign In */}
          <button
            type="submit"
            disabled={loading || loadingSandbox}
            className="w-full btn-primary h-[48px] md:h-[52px] text-xs font-bold uppercase tracking-wider font-heading mt-2 disabled:opacity-60"
          >
            {loadingSandbox ? (
              <RefreshCw size={14} className="animate-spin text-[var(--bg-void)]" />
            ) : (
              <Key size={14} />
            )}
            {loadingSandbox ? "Authenticating..." : "Establish Credentials Session"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--border-color)]" />
          <span className="text-[9px] font-mono tracking-widest text-[var(--text-muted)]">OAUTH_2.0</span>
          <div className="flex-1 h-px bg-[var(--border-color)]" />
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading || loadingSandbox}
          className="w-full flex items-center justify-center gap-3 h-[48px] md:h-[52px] border border-[var(--border-color)] rounded-[2px] font-semibold text-[13px] font-heading bg-[var(--bg-surface)] hover:border-[var(--accent-mint)] transition-all cursor-pointer disabled:opacity-60 mb-6"
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin text-[var(--accent-mint)]" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="truncate">Continue with Google</span>
        </button>

        {/* Security notice below card */}
        <div className="flex items-start gap-2.5 pt-4 border-t border-[var(--border-color)]">
          <Lock size={12} className="text-[var(--accent-mint)] flex-shrink-0 mt-0.5" />
          <p
            className="font-mono text-[11px] leading-relaxed text-[var(--text-muted)] text-center w-full"
            style={{ fontSize: "clamp(11px, 1.5vw, 12px)" }}
          >
            Google credentials are never stored. Traffic encrypted via TLS 1.3. Sessions expire automatically.
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--accent-mint)] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>

      {/* Adjust Card width responsiveness dynamically */}
      <style jsx global>{`
        .glass-card {
          max-width: 400px;
        }
        @media (max-width: 767px) {
          .glass-card {
            max-width: calc(100% - 32px);
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .glass-card {
            max-width: 380px;
          }
        }
      `}</style>
    </div>
  );
}
