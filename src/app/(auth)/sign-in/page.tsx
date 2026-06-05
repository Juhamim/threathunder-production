"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Shield, Key, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [loadingSandbox, setLoadingSandbox] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSandboxSignIn = async () => {
    setLoadingSandbox(true);
    await signIn("credentials", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center cyber-grid relative text-white" style={{ background: "transparent" }}>
      <motion.div
        className="glass-card p-10 w-full max-w-md relative z-10 border border-cyan-500/10 shadow-2xl"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-cyan-500/20 bg-cyan-950/20">
            <Shield size={30} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white tracking-wide">
            THREAT<span className="text-emerald-400">HUNTER</span>
          </h1>
          <p className="text-xs font-mono mt-1 text-gray-500 uppercase tracking-wider">
            CONSOLE // SECURE_ACCESS
          </p>
        </div>

        <h2 className="text-lg font-bold font-heading text-center text-white mb-1">
          console.authenticate()
        </h2>
        <p className="text-xs text-center font-mono text-gray-500 mb-8 uppercase tracking-wider">
          Sign in to establish secure session
        </p>

        {/* Google Sign In */}
        <motion.button
          onClick={handleGoogleSignIn}
          disabled={loading || loadingSandbox}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold text-xs font-mono transition-all border cursor-pointer"
          style={{
            background: loading ? "rgba(0, 217, 255, 0.03)" : "rgba(10, 10, 10, 0.6)",
            borderColor: "rgba(0, 217, 255, 0.15)",
            color: "#ffffff",
          }}
          whileHover={{ background: "rgba(0, 217, 255, 0.05)", borderColor: "rgba(0, 217, 255, 0.35)", boxShadow: "0 0 15px rgba(0, 217, 255, 0.1)" }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <RefreshCw size={16} className="animate-spin text-cyan-400" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {loading ? "INITIALIZING_SESSION..." : "AUTHENTICATE_WITH_GOOGLE"}
        </motion.button>

        {/* Sandbox Dev Bypass Button */}
        <motion.button
          onClick={handleSandboxSignIn}
          disabled={loading || loadingSandbox}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold text-xs font-mono transition-all border cursor-pointer mt-3"
          style={{
            background: "rgba(0, 255, 136, 0.03)",
            borderColor: "rgba(0, 255, 136, 0.2)",
            color: "#00ff88",
          }}
          whileHover={{ background: "rgba(0, 255, 136, 0.06)", borderColor: "rgba(0, 255, 136, 0.35)", boxShadow: "0 0 15px rgba(0, 255, 136, 0.1)" }}
          whileTap={{ scale: 0.98 }}
        >
          {loadingSandbox ? (
            <RefreshCw size={16} className="animate-spin text-emerald-400" />
          ) : (
            <Shield size={16} className="text-emerald-400 flex-shrink-0" />
          )}
          {loadingSandbox ? "ACCESSING_SANDBOX..." : "BYPASS_ACCESS_SANDBOX_CON"}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-[1px] bg-gray-900" />
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">SECURE_OAUTH_2.0</span>
          <div className="flex-1 h-[1px] bg-gray-900" />
        </div>

        {/* Encryption alert banner */}
        <div className="rounded-lg p-3 border border-emerald-500/10 bg-emerald-950/5">
          <div className="flex items-start gap-2.5">
            <Key size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] font-mono text-gray-500 leading-relaxed">
              Google passwords are never parsed or stored locally. All transaction tunnels are encrypted via TLS 1.3 endpoints.
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-600 font-mono mt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
          {" "}and{" "}
          <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>.
        </p>

        <div className="text-center mt-5">
          <Link href="/" className="text-xs font-mono text-gray-500 hover:text-cyan-400 transition-colors">
            ← BACK_TO_HOME
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
