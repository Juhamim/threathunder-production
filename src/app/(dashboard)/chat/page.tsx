"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Shield, Trash2, ChevronDown, Loader2 } from "lucide-react";
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
  "How do I stop SQL injection?",
  "What is a Zero-Day vulnerability?",
  "How serious is a CVSS score of 9.8?",
  "What are Indicators of Compromise (IoCs)?",
  "How do I harden an SSH server?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Session ID on client side
  useEffect(() => {
    let sid = localStorage.getItem("threathunter_chat_session_id");
    if (!sid) {
      sid = `session_${Date.now()}`;
      localStorage.setItem("threathunter_chat_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Load chat history from database
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
        console.error("Failed to load conversation history:", err);
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
      inputRef.current?.focus();
    }
  }, [loading, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto" style={{ height: "calc(100vh - 140px)" }}>
      {/* Header */}
      <motion.div className="glass-card p-4 mb-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(236,72,153,0.3)" }}>
            <Shield size={18} style={{ color: "#ec4899" }} />
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>AI Security Analyst</h1>
            <div className="flex items-center gap-1.5">
              <div className="status-dot" style={{ width: 6, height: 6 }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Gemini 2.5 Flash · Session active</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              const newSid = `session_${Date.now()}`;
              localStorage.setItem("threathunter_chat_session_id", newSid);
              setSessionId(newSid);
              setMessages([]);
            }}
            className="btn-ghost text-xs flex items-center gap-1 px-3 py-1.5"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4" id="chat-messages">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.15))", border: "1px solid rgba(236,72,153,0.2)" }}>
              <MessageSquare size={36} style={{ color: "#ec4899" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Your AI Security Analyst
            </h2>
            <p className="text-sm max-w-md mb-8" style={{ color: "var(--text-muted)" }}>
              Ask me anything about cybersecurity — threats, vulnerabilities, best practices, or get help understanding your security alerts.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-left text-xs p-3 rounded-lg transition-all"
                  style={{ background: "rgba(5,10,25,0.5)", border: "1px solid rgba(56,189,248,0.1)", color: "var(--text-secondary)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(236,72,153,0.3)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(56,189,248,0.1)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
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
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
                <Shield size={13} color="white" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm`}
              style={msg.role === "user" ? {
                background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "var(--text-primary)",
                borderRadius: "18px 18px 4px 18px",
              } : {
                background: "rgba(10,20,40,0.8)",
                border: "1px solid rgba(56,189,248,0.15)",
                color: "var(--text-primary)",
                borderRadius: "4px 18px 18px 18px",
              }}
            >
              {msg.role === "assistant" && msg.content === "" ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" style={{ color: "#ec4899" }} />
                  <span style={{ color: "var(--text-muted)" }}>Thinking...</span>
                </div>
              ) : msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none"
                  style={{ color: "var(--text-primary)" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ children, className }) => (
                        <code className={className}
                          style={{ background: "rgba(5,10,25,0.8)", padding: "2px 6px", borderRadius: 4, fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#38bdf8" }}>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre style={{ background: "rgba(5,10,25,0.9)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 8, padding: 12, overflowX: "auto" }}>
                          {children}
                        </pre>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ color: "#38bdf8" }}>{children}</strong>
                      ),
                    }}>
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

      {/* Input */}
      <motion.div className="glass-card p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about threats, vulnerabilities, best practices..."
            rows={1}
            disabled={loading}
            className="cyber-input flex-1 resize-none"
            style={{ minHeight: 44, maxHeight: 120 }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            id="chat-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 py-2.5 flex-shrink-0 flex items-center gap-2"
            style={{ opacity: !input.trim() || loading ? 0.5 : 1 }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
          Press Enter to send · Shift+Enter for new line · Powered by Gemini 2.5 Flash
        </p>
      </motion.div>
    </div>
  );
}
