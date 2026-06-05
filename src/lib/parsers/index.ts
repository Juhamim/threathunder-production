// ─── Log Parsers ──────────────────────────────────────────────────────────────

export interface ParsedLogEntry {
  lineNumber: number;
  timestamp?: Date;
  ip?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  responseSize?: number;
  userAgent?: string;
  username?: string;
  raw: string;
}

// Apache Combined Log Format:
// 127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326 "http://ref.com/" "Mozilla/4.08"
const APACHE_REGEX = /^(\S+)\s+\S+\s+(\S+)\s+\[([^\]]+)\]\s+"(\w+)\s+(\S+)\s+\S+"\s+(\d+)\s+(\S+)(?:\s+"[^"]*"\s+"([^"]*)")?/;

export function parseApacheLine(line: string, lineNum: number): ParsedLogEntry | null {
  const m = APACHE_REGEX.exec(line);
  if (!m) return null;
  return {
    lineNumber: lineNum,
    ip: m[1],
    username: m[2] !== "-" ? m[2] : undefined,
    timestamp: parseApacheDate(m[3]),
    method: m[4],
    path: m[5],
    statusCode: parseInt(m[6]),
    responseSize: m[7] !== "-" ? parseInt(m[7]) : 0,
    userAgent: m[8],
    raw: line,
  };
}

// Nginx access log (similar format)
export function parseNginxLine(line: string, lineNum: number): ParsedLogEntry | null {
  return parseApacheLine(line, lineNum); // Same format by default
}

// Syslog: Jun  4 12:34:56 hostname process[pid]: message
const SYSLOG_REGEX = /^(\w+\s+\d+\s+\d+:\d+:\d+)\s+\S+\s+\S+:\s+(.*)$/;
const AUTH_FAILED_REGEX = /Failed password for (?:invalid user )?(\S+) from (\d+\.\d+\.\d+\.\d+)/;
const AUTH_ACCEPT_REGEX = /Accepted password for (\S+) from (\d+\.\d+\.\d+\.\d+)/;

export function parseSyslogLine(line: string, lineNum: number): ParsedLogEntry | null {
  const m = SYSLOG_REGEX.exec(line);
  const failM = AUTH_FAILED_REGEX.exec(line);
  const acceptM = AUTH_ACCEPT_REGEX.exec(line);
  return {
    lineNumber: lineNum,
    timestamp: m ? new Date(m[1] + " " + new Date().getFullYear()) : undefined,
    username: failM?.[1] ?? acceptM?.[1],
    ip: failM?.[2] ?? acceptM?.[2],
    method: failM ? "FAILED_LOGIN" : acceptM ? "SUCCESS_LOGIN" : undefined,
    raw: line,
  };
}

// CSV: try to detect IP, timestamp, status columns
export function parseCsvLine(line: string, headers: string[], lineNum: number): ParsedLogEntry | null {
  const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
  const entry: ParsedLogEntry = { lineNumber: lineNum, raw: line };
  headers.forEach((h, i) => {
    const val = values[i] ?? "";
    const lh = h.toLowerCase();
    if (lh.includes("ip") || lh.includes("addr")) entry.ip = val;
    else if (lh.includes("time") || lh.includes("date")) entry.timestamp = new Date(val);
    else if (lh.includes("method")) entry.method = val;
    else if (lh.includes("path") || lh.includes("url") || lh.includes("uri")) entry.path = val;
    else if (lh.includes("status") || lh.includes("code")) entry.statusCode = parseInt(val) || undefined;
    else if (lh.includes("user")) entry.username = val;
    else if (lh.includes("agent")) entry.userAgent = val;
  });
  return entry;
}

// Generic fallback: try to extract IP and timestamp from any line
const IP_REGEX = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/;
const STATUS_REGEX = /\b([2345]\d{2})\b/;

export function parseGenericLine(line: string, lineNum: number): ParsedLogEntry {
  const ipM = IP_REGEX.exec(line);
  const statusM = STATUS_REGEX.exec(line);
  return {
    lineNumber: lineNum,
    ip: ipM?.[1],
    statusCode: statusM ? parseInt(statusM[1]) : undefined,
    raw: line,
  };
}

// ─── Master parser ─────────────────────────────────────────────────────────
export function detectLogType(content: string): "apache" | "nginx" | "syslog" | "auth" | "csv" | "generic" {
  const lines = content.split("\n").slice(0, 5).filter(Boolean);
  for (const line of lines) {
    if (APACHE_REGEX.test(line)) return "apache";
    if (/Failed password|Accepted password|sshd|auth/.test(line)) return "auth";
    if (/^(\w+\s+\d+\s+\d+:\d+:\d+)\s+\S+/.test(line)) return "syslog";
    if (line.includes(",") && lines[0]?.toLowerCase().match(/ip|time|status|method/)) return "csv";
  }
  return "generic";
}

export function parseLogContent(content: string, logType: string): ParsedLogEntry[] {
  const lines = content.split("\n").filter(line => line.trim());
  const entries: ParsedLogEntry[] = [];
  let csvHeaders: string[] = [];

  lines.forEach((line, i) => {
    try {
      let entry: ParsedLogEntry | null = null;
      switch (logType) {
        case "apache":
        case "nginx":
          entry = parseApacheLine(line, i + 1) ?? parseGenericLine(line, i + 1);
          break;
        case "syslog":
        case "auth":
          entry = parseSyslogLine(line, i + 1) ?? parseGenericLine(line, i + 1);
          break;
        case "csv":
          if (i === 0) { csvHeaders = line.split(",").map(h => h.trim()); return; }
          entry = parseCsvLine(line, csvHeaders, i + 1) ?? parseGenericLine(line, i + 1);
          break;
        default:
          entry = parseGenericLine(line, i + 1);
      }
      if (entry) entries.push(entry);
    } catch { /* skip bad lines */ }
  });

  return entries;
}

function parseApacheDate(dateStr: string): Date | undefined {
  try {
    // "10/Oct/2000:13:55:36 -0700"
    const [datePart, timePart] = dateStr.split(":");
    const [day, month, year] = datePart.split("/");
    const months: Record<string, string> = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
      Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    };
    return new Date(`${year}-${months[month]}-${day}T${timePart.split(" ")[0]}`);
  } catch { return undefined; }
}
