import { GoogleGenerativeAI } from "@google/generative-ai";
import { DetectedThreat } from "@/lib/threat-detection";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function getModel(streaming = false) {
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
  const model = getModel();

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
  const model = getModel();

  const threatSummary = threats.map(t =>
    `- ${t.severity.toUpperCase()} | ${t.title} | ${t.occurrences} occurrences | IPs: ${t.affectedIps.slice(0, 3).join(", ")}`
  ).join("\n");

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

  try {
    return JSON.parse(text);
  } catch {
    return {
      executiveSummary: "Security analysis completed. Multiple threats detected in the uploaded log file.",
      threatOverview: threatSummary,
      riskAssessment: `Risk score: ${riskScore}/100`,
      recommendedActions: ["Review all flagged IPs", "Update firewall rules", "Enable intrusion detection"],
      conclusion: "Immediate action required to remediate identified threats.",
      iocs: threats.flatMap(t => t.affectedIps).slice(0, 10),
      timeline: [{ time: "T+0", event: "Threats detected in logs" }],
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
  const model = getModel();

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: "System context: " + CHAT_SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Understood. I'm ThreatHunter AI Assistant, ready to help with cybersecurity analysis, threat investigation, and security guidance." }] },
      ...history,
    ],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

// ─── Streaming Chat ───────────────────────────────────────────────────────
export async function* streamChatWithAssistant(
  userMessage: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): AsyncGenerator<string> {
  const model = getModel(true);

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
}
