// ─── GitHub Secret Scanner ────────────────────────────────────────────────

export interface SecretFinding {
  type: string;
  severity: "critical" | "high" | "medium";
  file: string;
  line: number;
  match: string;
  description: string;
}

const SECRET_PATTERNS: { name: string; regex: RegExp; severity: "critical" | "high" | "medium"; description: string }[] = [
  {
    name: "AWS Access Key",
    regex: /AKIA[0-9A-Z]{16}/,
    severity: "critical",
    description: "AWS Access Key ID detected. Immediate rotation required.",
  },
  {
    name: "AWS Secret Key",
    regex: /(?:aws[_\-\s]*secret[_\-\s]*(?:access[_\-\s]*)?key|AWS_SECRET)['":\s=]+([A-Za-z0-9/+=]{40})/i,
    severity: "critical",
    description: "AWS Secret Access Key detected. Full account compromise risk.",
  },
  {
    name: "OpenAI API Key",
    regex: /sk-[a-zA-Z0-9]{20,}/,
    severity: "critical",
    description: "OpenAI API key detected. Could lead to unauthorized AI usage and billing.",
  },
  {
    name: "Anthropic API Key",
    regex: /sk-ant-[a-zA-Z0-9\-]{20,}/,
    severity: "critical",
    description: "Anthropic API key detected.",
  },
  {
    name: "Google API Key",
    regex: /AIza[0-9A-Za-z\-_]{35}/,
    severity: "high",
    description: "Google API key detected. Unauthorized API usage risk.",
  },
  {
    name: "GitHub Token",
    regex: /(?:ghp_|gho_|ghu_|ghs_|ghr_)[a-zA-Z0-9]{36}/,
    severity: "critical",
    description: "GitHub Personal Access Token detected. Repository access at risk.",
  },
  {
    name: "JWT Secret",
    regex: /(?:jwt[_\-\s]*secret|JWT_SECRET)['":\s=]+['"]?([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{16,})/i,
    severity: "high",
    description: "JWT secret key hardcoded. Authentication bypass risk.",
  },
  {
    name: "Database URL",
    regex: /(?:postgresql|mysql|mongodb|redis):\/\/[^\s'"<>]+:[^\s'"<>@]+@[^\s'"<>]+/i,
    severity: "critical",
    description: "Database connection string with credentials detected.",
  },
  {
    name: "Private Key (RSA/SSH)",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    severity: "critical",
    description: "Private key file detected. Cryptographic key exposure.",
  },
  {
    name: "Stripe Secret Key",
    regex: /sk_live_[a-zA-Z0-9]{24,}/,
    severity: "critical",
    description: "Stripe live secret key detected. Payment data compromise risk.",
  },
  {
    name: "Stripe Publishable Key",
    regex: /pk_live_[a-zA-Z0-9]{24,}/,
    severity: "medium",
    description: "Stripe live publishable key exposed.",
  },
  {
    name: "Slack Token",
    regex: /xox[baprs]-[0-9A-Za-z\-]{10,}/,
    severity: "high",
    description: "Slack API token detected.",
  },
  {
    name: "Generic Password",
    regex: /(?:password|passwd|pwd)['":\s=]+['"]([^'"\s]{8,})['"]?/i,
    severity: "medium",
    description: "Hardcoded password detected in source code.",
  },
  {
    name: "Generic API Key",
    regex: /(?:api[_\-]?key|apikey)['":\s=]+['"]([a-zA-Z0-9!@#$%^&*\-_]{16,})['"]?/i,
    severity: "medium",
    description: "Generic API key pattern detected.",
  },
];

export function scanContentForSecrets(content: string, filename: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = content.split("\n");

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    // Skip comments and obvious test values
    if (/^\s*#|^\s*\/\/|^\s*\*/.test(line)) continue;
    if (/test|example|sample|placeholder|your[-_]?|xxx|fake/i.test(line)) continue;

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(line)) {
        // Redact the actual secret for display
        const redacted = line.replace(pattern.regex, (match) => {
          const visible = Math.min(6, match.length);
          return match.substring(0, visible) + "***REDACTED***";
        });

        findings.push({
          type: pattern.name,
          severity: pattern.severity,
          file: filename,
          line: lineNum + 1,
          match: redacted,
          description: pattern.description,
        });
        break; // One finding per line
      }
    }
  }

  return findings;
}
