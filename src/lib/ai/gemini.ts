import { GoogleGenerativeAI } from "@google/generative-ai";
import { DetectedThreat } from "@/lib/threat-detection";

const isGeminiConfigured = !!(
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== "your-gemini-api-key" &&
  process.env.GEMINI_API_KEY.trim() !== ""
);

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY!) : null;

function getModel(streaming = false) {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-05-20",
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });
}

// ─── Threat Analysis ──────────────────────────────────────────────────────
export async function analyzeThreat(threat: DetectedThreat): Promise<string> {
  try {
    const model = getModel();
    if (!model) throw new Error("Gemini not configured");

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean up markdown code fences if present
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
    const model = getModel();
    if (!model) throw new Error("Gemini not configured");

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

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.warn("Gemini generateIncidentReport failed, using fallback:", error);
    return {
      executiveSummary: `Log analysis completed for file '${filename}' under Sandbox/offline mode. Basic threat rules detected ${threats.length} potential attack sequences. To generate deep AI incident writeups, configure a valid GEMINI_API_KEY.`,
      threatOverview: `Rule heuristics matching identified typical attack signatures across ${threats.length} instances. Primary triggers: ${threats.map(t => t.title).slice(0, 3).join(", ")}.`,
      riskAssessment: `Risk level assessed at ${riskScore}/100. Action is recommended to secure assets from IP sources: ${threats.flatMap(t => t.affectedIps).slice(0, 5).join(", ")}.`,
      recommendedActions: [
        "Isolate/nullroute top requesting IP addresses in security policies.",
        "Enable valid Google Gemini API key to activate automated incident summaries.",
        "Review server configuration against standard vulnerability configurations."
      ],
      conclusion: "Preliminary heuristics scan completed. Live AI report requires a valid Gemini API key in configuration settings.",
      iocs: Array.from(new Set(threats.flatMap(t => t.affectedIps))).slice(0, 10),
      timeline: threats.map((t, idx) => ({
        time: `T+${idx * 4}m`,
        event: `Alert: ${t.title} triggered by source IP(s).`
      })).slice(0, 5)
    };
  }
}

// ─── Chat Assistant ───────────────────────────────────────────────────────
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

export async function chatWithAssistant(
  userMessage: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  try {
    const model = getModel();
    if (!model) throw new Error("Gemini not configured");

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System context: " + CHAT_SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I'm ThreatHunter AI Assistant, ready to help with cybersecurity analysis, threat investigation, and security guidance." }] },
        ...history,
      ],
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini chatWithAssistant failed, using fallback:", error);
    return "Gemini API key is unconfigured or invalid. Please save a valid GEMINI_API_KEY in .env.local to activate the interactive chat assistant.";
  }
}

// ─── Streaming Chat ───────────────────────────────────────────────────────
export async function* streamChatWithAssistant(
  userMessage: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): AsyncGenerator<string> {
  try {
    const model = getModel(true);
    if (!model) throw new Error("Gemini not configured");

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System context: " + CHAT_SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I'm ThreatHunter AI Assistant, ready to help with cybersecurity analysis." }] },
        ...history,
      ],
    });

    const result = await chat.sendMessageStream(userMessage);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (error) {
    console.warn("Gemini streamChatWithAssistant failed, using fallback:", error);
    yield "Hello! I am the **ThreatHunter AI Assistant**. \n\n" +
          "It looks like your **Gemini API Key** is not configured, or is using the default placeholder value. \n\n" +
          "### How to Enable Live AI Analysis & Chat:\n" +
          "1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to generate a free Gemini API Key.\n" +
          "2. Open `threathunter-ai/.env.local` or `.env.example` in your editor.\n" +
          "3. Change the line `GEMINI_API_KEY=your-gemini-api-key` to your actual API key.\n" +
          "4. **Save** the file to disk. The server will hot-reload and activate the AI features immediately!\n\n" +
          "*(In the meantime, the dashboard log heuristics and local sandbox authentication remain fully functional!)*";
  }
}
