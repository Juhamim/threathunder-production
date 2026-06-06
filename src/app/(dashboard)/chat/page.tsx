"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Shield,
  Trash2,
  Loader2,
  Paperclip,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Explain how brute force attacks work",
  "How do I prevent SQL injection in Node.js?",
  "What is a Zero-Day vulnerability?",
  "How should I respond to a CVSS 9.8 score?",
  "What are standard Indicators of Compromise?",
  "Recommend best practices for SSH hardening",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Session ID
  useEffect(() => {
    let sid = localStorage.getItem("threathunter_chat_session_id");
    if (!sid) {
      sid = `session_${Date.now()}`;
      localStorage.setItem("threathunter_chat_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Load chat history
  useEffect(() => {
    if (!sessionId) return;
    async function loadHistory() {
      try {
        const res = await fetch(`/api/ai/chat?sessionId=${sessionId}`);
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        const mapped = data.map((msg: any) => ({
          id: msg.id,
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(mapped);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    }
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), sessionId }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id
                  ? { ...m, content: m.content + parsed.text }
                  : m
              ));
            }
          } catch { /* skip */ }
        }
      }
    } catch (e: any) {
      toast.error("Chat failed. Check your Gemini API key.");
      setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.style.height = "auto";
      }
    }
  }, [loading, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClearChat = () => {
    const newSid = `session_${Date.now()}`;
    localStorage.setItem("threathunter_chat_session_id", newSid);
    setSessionId(newSid);
    setMessages([]);
    toast.success("Conversation history cleared.");
  };

  const handleAttachment = () => {
    toast.info("Ingestion telemetry upload: Click 'Log Analysis' in sidebar to upload threat logs directly.");
  };

  return (
    <div className="workspace-container grid grid-rows-[auto_1fr_auto] h-[calc(100vh-100px)] overflow-hidden">
      {/* ── Compact Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-[#1E2229] pb-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(236,72,153,0.1)] border border-[rgba(236,72,153,0.2)] flex items-center justify-center">
            <Shield size={16} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-md font-bold text-white leading-none">AI Security Analyst</h1>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">Gemini 2.5 Flash / COGNITIVE_NODE</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="btn-ghost flex items-center gap-2 text-xs h-[32px] px-3.5"
          >
            <Trash2 size={13} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* ── Message Column (Scroll Area) ── */}
      <div className="flex-grow overflow-y-auto px-1 py-4 space-y-5 min-h-0">
        <div className="max-w-[900px] mx-auto w-full space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-10 max-w-xl mx-auto"
            >
              <div className="w-14 h-14 rounded-2xl bg-[rgba(236,72,153,0.08)] border border-[rgba(236,72,153,0.15)] flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-[#ec4899]" />
              </div>
              <h2 className="text-lg font-bold mb-1 text-white">
                How can I assist your investigation?
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-6 max-w-sm leading-relaxed">
                Consult with the AI security node regarding malicious vectors, log indicators, network anomalies, or remediation plans.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs p-3.5 rounded-xl transition-all duration-200 bg-[#13161B]/50 border border-white/5 hover:border-pink-500/30 hover:bg-[#1A1F27] hover:-translate-y-0.5 text-[#C8C4BC] hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 bg-gradient-to-br from-pink-500 to-violet-600">
                  <Shield size={13} className="text-white" />
                </div>
              )}

              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
                        border: "1px solid rgba(59,130,246,0.2)",
                        color: "var(--text-primary)",
                        borderRadius: "18px 18px 4px 18px",
                        maxWidth: "80%",
                      }
                    : {
                        background: "rgba(13,17,23,0.8)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "var(--text-primary)",
                        borderRadius: "4px 18px 18px 18px",
                        maxWidth: "85%",
                        width: "100%",
                      }
                }
              >
                {msg.role === "assistant" && msg.content === "" ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-pink-400" />
                    <span className="text-xs text-[var(--text-muted)] font-mono">THINKING_ENGINE_RUNNING...</span>
                  </div>
                ) : msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-white leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ children, className }) => (
                          <code
                            className={className}
                            style={{
                              background: "rgba(5,10,25,0.8)",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 12,
                              fontFamily: "JetBrains Mono, monospace",
                              color: "#38bdf8",
                            }}
                          >
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre style={{ background: "rgba(5,10,25,0.9)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 8, padding: 12, overflowX: "auto" }}>
                            {children}
                          </pre>
                        ),
                        strong: ({ children }) => (
                          <strong style={{ color: "#ec4899", fontWeight: "bold" }}>{children}</strong>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Sticky Input Footer Panel ── */}
      <div className="flex-shrink-0 border-t border-[#1E2229] pt-4 bg-[#0A0C0F]">
        <div className="max-w-[900px] mx-auto w-full">
          <div className="glass-card p-3 relative flex flex-col gap-2 rounded-2xl bg-[#0D1117]/85 border border-[#1E2229]">
            <div className="flex items-end gap-3">
              {/* Attachment trigger */}
              <button
                onClick={handleAttachment}
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-[#1A1F27] hover:text-white text-[#6B7280] transition-colors border border-transparent hover:border-[#1E2229]"
                title="Attach log snippet"
              >
                <Paperclip size={16} />
              </button>

              <textarea
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about logs, mitigations, rule filters..."
                rows={1}
                disabled={loading}
                className="cyber-input flex-grow resize-none pl-4 pr-10 py-2.5 h-[38px] bg-transparent border-0 focus:bg-transparent"
                style={{ minHeight: 38, maxHeight: 120 }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />

              {/* In-prompt active status */}
              <div className="absolute right-16 bottom-5 hidden sm:flex items-center gap-1.5 opacity-30">
                <Sparkles size={11} className="text-pink-400" />
                <span className="text-[9px] font-mono">GEMINI_FLASH</span>
              </div>

              <button
                id="chat-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="btn-primary w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center p-0"
                style={{ opacity: !input.trim() || loading ? 0.5 : 1, backgroundColor: "#ec4899", borderColor: "#ec4899" }}
              >
                {loading ? <Loader2 size={15} className="animate-spin text-white" /> : <Send size={15} className="text-white" />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-[var(--text-muted)] mt-2 font-mono">
            Press Enter to transmit · Shift+Enter for newline · Security actions are local
          </p>
        </div>
      </div>
    </div>
  );
}
