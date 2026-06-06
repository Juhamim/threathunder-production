import { GoogleGenerativeAI } from "@google/generative-ai";
import { DetectedThreat } from "@/lib/threat-detection";

// Strip any accidental surrounding quotes that dotenv/shell may add
const rawKey = (process.env.GEMINI_API_KEY ?? "").replace(/^["']|["']$/g, "").trim();

const isGeminiConfigured = !!(rawKey && rawKey !== "your-gemini-api-key");

if (isGeminiConfigured) {
  console.log("[Gemini] API key loaded, length:", rawKey.length);
} else {
  console.warn("[Gemini] API key not configured.");
}

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(rawKey) : null;

// Model priority list — confirmed working models (tested against your API key)
const MODEL_PRIORITY = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

const GEN_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 4096,
};

const CHAT_SYSTEM_PROMPT = `You are ThreatHunter AI Assistant — an expert cybersecurity analyst and educator embedded in a Security Operations Center (SOC) platform.

Your role:
- Answer cybersecurity questions clearly and professionally
- Explain threats, vulnerabilities, and attack techniques
- Provide actionable remediation advice
- Help students and junior analysts learn cybersecurity concepts
- Analyze specific threats when asked

Tone: Professional yet approachable. Use simple language for beginners but include technical depth when asked.
Format: Use markdown for readability. Include code examples when relevant.
Focus: Keep responses focused on cybersecurity and security operations.`;

/** Call generateContent with automatic model fallback on 503/429/404 */
async function generateWithFallback(prompt: string): Promise<string> {
  if (!genAI) throw new Error("Gemini not configured");
  let lastError: unknown;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: GEN_CONFIG });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message ?? "");
      const is429 = err?.status === 429 || msg.includes("429") || msg.includes("quota");
      const is503 = err?.status === 503 || msg.includes("503") || msg.includes("high demand");
      const is404 = err?.status === 404 || msg.includes("404");
      const isRetryable = is429 || is503 || is404;
      const isLastModel = modelName === MODEL_PRIORITY[MODEL_PRIORITY.length - 1];
      if (isRetryable && !isLastModel) {
        console.warn(`[Gemini] ${modelName} unavailable (${err?.status ?? "err"}), trying next model...`);
        if (is429) await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}


/** Stream chat with automatic model fallback on 503/429/404 */
async function* streamWithFallback(
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[],
  message: string
): AsyncGenerator<string> {
  if (!genAI) throw new Error("Gemini not configured");
  let lastError: unknown;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: GEN_CONFIG });
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessageStream(message);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
      return; // success
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message ?? "");
      const is429 = err?.status === 429 || msg.includes("429") || msg.includes("quota");
      const is503 = err?.status === 503 || msg.includes("503") || msg.includes("high demand");
      const is404 = err?.status === 404 || msg.includes("404");
      const isRetryable = is429 || is503 || is404;
      const isLastModel = modelName === MODEL_PRIORITY[MODEL_PRIORITY.length - 1];
      if (isRetryable && !isLastModel) {
        console.warn(`[Gemini] ${modelName} unavailable (${err?.status ?? "err"}), trying next model...`);
        if (is429) await new Promise(r => setTimeout(r, 2000)); // brief pause on quota errors
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// ─── Threat Analysis ──────────────────────────────────────────────────────
export async function analyzeThreat(threat: DetectedThreat): Promise<string> {
  try {
    if (!isGeminiConfigured) throw new Error("Gemini not configured");

    const prompt = `You are an expert SOC analyst. Analyze this security threat and provide a clear, professional explanation.

THREAT DETAILS:
- Type: ${threat.type.replace(/_/g, " ").toUpperCase()}
- Severity: ${threat.severity.toUpperCase()}
- Title: ${threat.title}
- Description: ${threat.description}
- Occurrences: ${threat.occurrences}
- Affected IPs: ${threat.affectedIps.join(", ")}

EVIDENCE (sample log lines):
${threat.evidence.slice(0, 3).join("\n")}

Provide your analysis in this EXACT JSON format (no markdown, just JSON):
{
  "attackType": "Brief name of the attack",
  "whatHappened": "Plain English explanation of what occurred (2-3 sentences, beginner-friendly)",
  "impact": "What damage could this cause to the system or organization",
  "likelihood": "LOW | MEDIUM | HIGH | CRITICAL — how serious is this",
  "immediateActions": ["Action 1", "Action 2", "Action 3"],
  "longTermRemediation": ["Remediation 1", "Remediation 2"],
  "technicalDetails": "Technical details for senior analysts"
}`;

    const text = await generateWithFallback(prompt);
    return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  } catch (error) {
    console.warn("Gemini analyzeThreat failed, using fallback:", error);
    return JSON.stringify({
      attackType: threat.title,
      whatHappened: `Heuristics flagged potential ${threat.type.replace(/_/g, " ")} vector from ${threat.affectedIps.join(", ")}.`,
      impact: "Potential compromise or service degradation depending on exposed system vulnerabilities.",
      likelihood: threat.severity.toUpperCase(),
      immediateActions: [
        "Block identified IP sources via firewall/security groups.",
        "Verify application configuration for standard defense layers.",
        "Provide a valid GEMINI_API_KEY in .env.local for full intelligence correlation."
      ],
      longTermRemediation: [
        "Establish rate limit thresholds.",
        "Implement continuous intrusion detection systems (IDS)."
      ],
      technicalDetails: `Local engine detected ${threat.occurrences} suspicious requests. Sample matching log: ${threat.evidence[0] || "None"}`
    });
  }
}

// ─── Full AI Report Generation ────────────────────────────────────────────
export async function generateIncidentReport(
  threats: DetectedThreat[],
  filename: string,
  riskScore: number,
  logType: string
): Promise<{
  executiveSummary: string;
  threatOverview: string;
  riskAssessment: string;
  recommendedActions: string[];
  conclusion: string;
  iocs: string[];
  timeline: { time: string; event: string }[];
}> {
  const threatSummary = threats.map(t =>
    `- ${t.severity.toUpperCase()} | ${t.title} | ${t.occurrences} occurrences | IPs: ${t.affectedIps.slice(0, 3).join(", ")}`
  ).join("\n");

  try {
    if (!isGeminiConfigured) throw new Error("Gemini not configured");

    const prompt = `You are a senior cybersecurity analyst. Generate a professional incident response report.

INCIDENT CONTEXT:
- Log File: ${filename}
- Log Type: ${logType}
- Risk Score: ${riskScore}/100 (${riskScore <= 30 ? "CRITICAL" : riskScore <= 50 ? "HIGH RISK" : riskScore <= 70 ? "MODERATE" : "LOW RISK"})
- Total Threats: ${threats.length}
- Critical: ${threats.filter(t => t.severity === "critical").length}
- High: ${threats.filter(t => t.severity === "high").length}

THREATS DETECTED:
${threatSummary}

Generate a professional security incident report in this EXACT JSON format:
{
  "executiveSummary": "3-4 sentence executive summary suitable for management/non-technical stakeholders",
  "threatOverview": "Detailed technical overview of all threats found, their nature and scope",
  "riskAssessment": "Assessment of overall risk level, business impact, and urgency",
  "recommendedActions": [
    "Immediate action 1 (do within 1 hour)",
    "Immediate action 2",
    "Short-term action (do within 24 hours)",
    "Long-term improvement 1",
    "Long-term improvement 2"
  ],
  "conclusion": "Professional conclusion summarizing the incident and next steps",
  "iocs": ["indicator1 (IP/pattern)", "indicator2", "indicator3"],
  "timeline": [
    {"time": "T+0", "event": "Initial access or first suspicious activity"},
    {"time": "T+5min", "event": "Escalation or continued attack"},
    {"time": "T+Detection", "event": "Threat detected by ThreatHunter AI"}
  ]
}`;

    const text = await generateWithFallback(prompt);
    return JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
  } catch (error) {
    console.warn("Gemini generateIncidentReport failed, using fallback:", error);
    return {
      executiveSummary: `Log analysis completed for file '${filename}'. Basic threat rules detected ${threats.length} potential attack sequences.`,
      threatOverview: `Rule heuristics matching identified typical attack signatures across ${threats.length} instances. Primary triggers: ${threats.map(t => t.title).slice(0, 3).join(", ")}.`,
      riskAssessment: `Risk level assessed at ${riskScore}/100. Action is recommended to secure assets from IP sources: ${threats.flatMap(t => t.affectedIps).slice(0, 5).join(", ")}.`,
      recommendedActions: [
        "Isolate/nullroute top requesting IP addresses in security policies.",
        "Review server configuration against standard vulnerability configurations.",
        "Enable monitoring to detect recurring patterns."
      ],
      conclusion: "Preliminary heuristics scan completed.",
      iocs: Array.from(new Set(threats.flatMap(t => t.affectedIps))).slice(0, 10),
      timeline: threats.map((t, idx) => ({
        time: `T+${idx * 4}m`,
        event: `Alert: ${t.title} triggered by source IP(s).`
      })).slice(0, 5)
    };
  }
}

// ─── Chat Assistant (non-streaming) ──────────────────────────────────────
export async function chatWithAssistant(
  userMessage: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  try {
    if (!isGeminiConfigured) throw new Error("Gemini not configured");
    const fullHistory = [
      { role: "user" as const, parts: [{ text: "System context: " + CHAT_SYSTEM_PROMPT }] },
      { role: "model" as const, parts: [{ text: "Understood. I'm ThreatHunter AI Assistant, ready to help with cybersecurity analysis, threat investigation, and security guidance." }] },
      ...history,
    ];
    const chunks: string[] = [];
    for await (const text of streamWithFallback(fullHistory, userMessage)) {
      chunks.push(text);
    }
    return chunks.join("");
  } catch (error) {
    console.warn("Gemini chatWithAssistant failed:", error);
    return "AI assistant temporarily unavailable. Please try again.";
  }
}

// ─── Streaming Chat ───────────────────────────────────────────────────────
export async function* streamChatWithAssistant(
  userMessage: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): AsyncGenerator<string> {
  try {
    if (!isGeminiConfigured) throw new Error("Gemini not configured");
    const fullHistory = [
      { role: "user" as const, parts: [{ text: "System context: " + CHAT_SYSTEM_PROMPT }] },
      { role: "model" as const, parts: [{ text: "Understood. I'm ThreatHunter AI Assistant, ready to help with cybersecurity analysis." }] },
      ...history,
    ];
    yield* streamWithFallback(fullHistory, userMessage);
  } catch (error: any) {
    const msg = String(error?.message ?? error ?? "Unknown error");
    console.error("[Gemini] streamChatWithAssistant failed:", msg, error);
    if (!isGeminiConfigured) {
      yield "⚠️ AI assistant is not configured. Please add a valid GEMINI_API_KEY in your .env.local file.";
    } else if (msg.includes("API_KEY_INVALID") || msg.includes("400")) {
      yield "⚠️ Invalid Gemini API key. Please get a valid key from https://aistudio.google.com/app/apikey and update your .env.local.";
    } else if (msg.includes("429") || msg.includes("quota")) {
      yield "⚠️ API quota limit reached. You've used your free tier allowance. Please wait a minute and try again, or upgrade your Google AI plan at https://ai.google.dev/pricing";
    } else {
      yield `⚠️ The AI assistant encountered a temporary issue. Please try again in a moment.`;
    }
  }
}
