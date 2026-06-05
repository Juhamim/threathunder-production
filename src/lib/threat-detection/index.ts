import { ParsedLogEntry } from "@/lib/parsers";

export type ThreatSeverity = "low" | "medium" | "high" | "critical";
export type ThreatType =
  | "brute_force"
  | "sql_injection"
  | "xss"
  | "directory_traversal"
  | "credential_stuffing"
  | "suspicious_bot"
  | "privilege_escalation";

export interface DetectedThreat {
  type: ThreatType;
  severity: ThreatSeverity;
  title: string;
  description: string;
  evidence: string[];
  affectedIps: string[];
  occurrences: number;
}

// ─── Rule: Brute Force ────────────────────────────────────────────────────
function detectBruteForce(entries: ParsedLogEntry[]): DetectedThreat[] {
  const ipFailMap: Record<string, string[]> = {};

  for (const entry of entries) {
    const isFailed =
      entry.statusCode === 401 ||
      entry.statusCode === 403 ||
      entry.method === "FAILED_LOGIN" ||
      /failed|invalid|unauthorized/i.test(entry.raw);

    if (isFailed && entry.ip) {
      if (!ipFailMap[entry.ip]) ipFailMap[entry.ip] = [];
      ipFailMap[entry.ip].push(entry.raw);
    }
  }

  const threats: DetectedThreat[] = [];
  for (const [ip, lines] of Object.entries(ipFailMap)) {
    if (lines.length >= 5) {
      const sev: ThreatSeverity = lines.length >= 50 ? "critical" : lines.length >= 20 ? "high" : "medium";
      threats.push({
        type: "brute_force",
        severity: sev,
        title: `Brute Force Attack from ${ip}`,
        description: `IP ${ip} made ${lines.length} failed authentication attempts, indicating a brute force attack.`,
        evidence: lines.slice(0, 5),
        affectedIps: [ip],
        occurrences: lines.length,
      });
    }
  }
  return threats;
}

// ─── Rule: SQL Injection ──────────────────────────────────────────────────
const SQL_PATTERNS = [
  /union\s+select/i,
  /or\s+1\s*=\s*1/i,
  /;\s*drop\s+table/i,
  /;\s*select\s+\*/i,
  /';\s*--/i,
  /xp_cmdshell/i,
  /exec\s*\(/i,
  /\bsleep\s*\(\s*\d+\s*\)/i,
  /benchmark\s*\(/i,
  /load_file\s*\(/i,
  /%27.*%27/i, // URL encoded single quotes
  /0x[0-9a-f]{4,}/i, // hex encoding
];

function detectSqlInjection(entries: ParsedLogEntry[]): DetectedThreat[] {
  const matches: { ip: string; line: string }[] = [];

  for (const entry of entries) {
    const target = (entry.path ?? "") + " " + entry.raw;
    if (SQL_PATTERNS.some(p => p.test(target))) {
      matches.push({ ip: entry.ip ?? "unknown", line: entry.raw });
    }
  }

  if (matches.length === 0) return [];

  const uniqueIps = [...new Set(matches.map(m => m.ip))];
  return [{
    type: "sql_injection",
    severity: matches.length >= 10 ? "critical" : matches.length >= 3 ? "high" : "medium",
    title: `SQL Injection Attempts Detected`,
    description: `${matches.length} SQL injection attempt(s) detected from ${uniqueIps.length} unique IP(s). Attackers are attempting to manipulate database queries.`,
    evidence: matches.slice(0, 5).map(m => m.line),
    affectedIps: uniqueIps,
    occurrences: matches.length,
  }];
}

// ─── Rule: XSS ────────────────────────────────────────────────────────────
const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript\s*:/i,
  /on\w+\s*=/i, // onclick=, onerror=
  /<img[^>]+src\s*=\s*['"]?\s*javascript/i,
  /eval\s*\(/i,
  /document\.cookie/i,
  /\.innerHTML\s*=/i,
  /%3Cscript/i, // URL encoded
  /alert\s*\(/i,
  /\bxss\b/i,
];

function detectXss(entries: ParsedLogEntry[]): DetectedThreat[] {
  const matches: { ip: string; line: string }[] = [];

  for (const entry of entries) {
    const target = (entry.path ?? "") + " " + entry.raw;
    if (XSS_PATTERNS.some(p => p.test(target))) {
      matches.push({ ip: entry.ip ?? "unknown", line: entry.raw });
    }
  }

  if (matches.length === 0) return [];

  const uniqueIps = [...new Set(matches.map(m => m.ip))];
  return [{
    type: "xss",
    severity: matches.length >= 5 ? "high" : "medium",
    title: `Cross-Site Scripting (XSS) Attempts`,
    description: `${matches.length} XSS attempt(s) detected. Attackers are injecting malicious scripts into web requests.`,
    evidence: matches.slice(0, 5).map(m => m.line),
    affectedIps: uniqueIps,
    occurrences: matches.length,
  }];
}

// ─── Rule: Directory Traversal ────────────────────────────────────────────
const TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.%2f/i,
  /%2e%2e%2f/i,
  /\.\.%5c/i,
  /\/etc\/passwd/i,
  /\/etc\/shadow/i,
  /\/windows\/win\.ini/i,
  /\.\.\\/, // backslash traversal
];

function detectDirectoryTraversal(entries: ParsedLogEntry[]): DetectedThreat[] {
  const matches: { ip: string; line: string }[] = [];

  for (const entry of entries) {
    const target = (entry.path ?? "") + " " + entry.raw;
    if (TRAVERSAL_PATTERNS.some(p => p.test(target))) {
      matches.push({ ip: entry.ip ?? "unknown", line: entry.raw });
    }
  }

  if (matches.length === 0) return [];

  const uniqueIps = [...new Set(matches.map(m => m.ip))];
  return [{
    type: "directory_traversal",
    severity: "high",
    title: `Directory Traversal Attempts`,
    description: `${matches.length} path traversal attempt(s) detected. Attackers are attempting to access files outside the web root.`,
    evidence: matches.slice(0, 5).map(m => m.line),
    affectedIps: uniqueIps,
    occurrences: matches.length,
  }];
}

// ─── Rule: Credential Stuffing ────────────────────────────────────────────
function detectCredentialStuffing(entries: ParsedLogEntry[]): DetectedThreat[] {
  const loginPaths = entries.filter(e =>
    e.path && /login|signin|auth|session/.test(e.path) &&
    (e.statusCode === 401 || e.statusCode === 403 || e.method === "FAILED_LOGIN")
  );

  if (loginPaths.length < 10) return [];

  // Multiple IPs hitting login endpoint = credential stuffing
  const ips = [...new Set(loginPaths.map(e => e.ip ?? "unknown"))];
  if (ips.length < 3) return []; // brute force handles single-IP case

  return [{
    type: "credential_stuffing",
    severity: loginPaths.length >= 50 ? "critical" : "high",
    title: `Credential Stuffing Attack Detected`,
    description: `${loginPaths.length} failed login attempts from ${ips.length} different IPs against authentication endpoints. This pattern suggests automated credential stuffing.`,
    evidence: loginPaths.slice(0, 5).map(e => e.raw),
    affectedIps: ips,
    occurrences: loginPaths.length,
  }];
}

// ─── Rule: Suspicious Bots ────────────────────────────────────────────────
const MALICIOUS_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /dirbuster/i,
  /gobuster/i,
  /wfuzz/i,
  /hydra/i,
  /metasploit/i,
  /python-requests\/[0-9]/i,
  /curl\/[0-9]/i,
  /go-http-client/i,
  /java\/[0-9]/i,
  /scrapy/i,
];

function detectSuspiciousBots(entries: ParsedLogEntry[]): DetectedThreat[] {
  const matches: { ip: string; ua: string; line: string }[] = [];

  for (const entry of entries) {
    if (entry.userAgent && MALICIOUS_UA_PATTERNS.some(p => p.test(entry.userAgent!))) {
      matches.push({ ip: entry.ip ?? "unknown", ua: entry.userAgent!, line: entry.raw });
    }
  }

  if (matches.length === 0) return [];

  const uniqueIps = [...new Set(matches.map(m => m.ip))];
  const uniqueUAs = [...new Set(matches.map(m => m.ua))];

  return [{
    type: "suspicious_bot",
    severity: matches.length >= 20 ? "high" : "medium",
    title: `Malicious Scanner/Bot Activity`,
    description: `${matches.length} request(s) from known attack tools: ${uniqueUAs.slice(0, 3).join(", ")}. Automated scanning tools detected.`,
    evidence: matches.slice(0, 5).map(m => m.line),
    affectedIps: uniqueIps,
    occurrences: matches.length,
  }];
}

// ─── Rule: Privilege Escalation ───────────────────────────────────────────
const ADMIN_PATHS = [
  /\/admin/i,
  /\/wp-admin/i,
  /\/administrator/i,
  /\/phpmyadmin/i,
  /\/\.env/i,
  /\/config\./i,
  /\/api\/admin/i,
  /\/root\//i,
  /sudo/i,
  /su\s+root/i,
];

function detectPrivilegeEscalation(entries: ParsedLogEntry[]): DetectedThreat[] {
  const matches: { ip: string; line: string }[] = [];

  for (const entry of entries) {
    const target = (entry.path ?? "") + " " + entry.raw;
    const isUnauthorized = entry.statusCode === 403 || entry.statusCode === 401;
    if (ADMIN_PATHS.some(p => p.test(target)) && (isUnauthorized || !entry.statusCode)) {
      matches.push({ ip: entry.ip ?? "unknown", line: entry.raw });
    }
  }

  if (matches.length === 0) return [];

  const uniqueIps = [...new Set(matches.map(m => m.ip))];
  return [{
    type: "privilege_escalation",
    severity: matches.length >= 5 ? "critical" : "high",
    title: `Privilege Escalation / Unauthorized Admin Access`,
    description: `${matches.length} unauthorized attempt(s) to access privileged resources or admin interfaces.`,
    evidence: matches.slice(0, 5).map(m => m.line),
    affectedIps: uniqueIps,
    occurrences: matches.length,
  }];
}

// ─── Master detector ──────────────────────────────────────────────────────
export function detectThreats(entries: ParsedLogEntry[]): DetectedThreat[] {
  const allThreats: DetectedThreat[] = [
    ...detectBruteForce(entries),
    ...detectSqlInjection(entries),
    ...detectXss(entries),
    ...detectDirectoryTraversal(entries),
    ...detectCredentialStuffing(entries),
    ...detectSuspiciousBots(entries),
    ...detectPrivilegeEscalation(entries),
  ];

  // Sort by severity
  const severityOrder: Record<ThreatSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return allThreats.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

// ─── Risk Scorer ──────────────────────────────────────────────────────────
export function calculateRiskScore(threats: DetectedThreat[]): {
  score: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
} {
  const criticalCount = threats.filter(t => t.severity === "critical").length;
  const highCount = threats.filter(t => t.severity === "high").length;
  const mediumCount = threats.filter(t => t.severity === "medium").length;
  const lowCount = threats.filter(t => t.severity === "low").length;

  // Start at 100 (secure), deduct based on findings
  let score = 100;
  score -= criticalCount * 25;
  score -= highCount * 15;
  score -= mediumCount * 7;
  score -= lowCount * 3;

  // Cap between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return { score, criticalCount, highCount, mediumCount, lowCount };
}
