# 🛡️ ThreatHunter AI

<div align="center">

### 🚀 AI-Powered Security Operations Center

**Detect • Investigate • Analyze • Respond**

ThreatHunter AI is a modern, open-source cybersecurity platform that combines advanced threat detection, AI-powered investigation, GitHub secret scanning, and executive incident reporting into a single SOC experience.

[🌐 Live Demo](https://threathunder-production.vercel.app) • [🐙 GitHub Repository](https://github.com/Juhamim/threathunder-production)

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Gemini](https://img.shields.io/badge/Google-Gemini-success)
![Cybersecurity](https://img.shields.io/badge/Category-Cybersecurity-red)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# 🎯 Why ThreatHunter?

Traditional SOC platforms are often expensive, difficult to deploy, and inaccessible to students, startups, researchers, and independent security analysts.

ThreatHunter AI was built to solve this problem by providing:

✅ AI-Powered Threat Investigation

✅ Real-Time Threat Detection

✅ GitHub Secret Exposure Scanning

✅ Executive Incident Reporting

✅ Security Operations Dashboard

✅ Self-Hosted Deployment

✅ Open Source Transparency

✅ Zero Vendor Lock-In

Whether you're a cybersecurity student, penetration tester, SOC analyst, developer, or security researcher, ThreatHunter gives you enterprise-grade capabilities without enterprise-grade costs.

---

# ✨ Core Features

## 🧠 AI Log Analysis

Upload security logs and receive instant AI-powered threat intelligence.

### Supported Log Sources

* Nginx Access Logs
* Apache Access Logs
* Authentication Logs
* Custom Security Logs
* Application Logs

### Threat Detection

* SQL Injection (SQLi)
* Cross-Site Scripting (XSS)
* Command Injection
* Directory Traversal
* SSH Brute Force
* Credential Stuffing
* Authentication Abuse
* Suspicious User Agents
* Reconnaissance Activity
* Rate Limit Violations

### AI Investigation

Gemini AI automatically generates:

* Executive Summary
* Threat Explanation
* Risk Assessment
* Indicators of Compromise (IOCs)
* Attack Timeline
* Mitigation Recommendations
* Remediation Guidance

---

## 🔑 GitHub Secret Scanner

ThreatHunter scans repositories for exposed secrets and security risks.

### Detection Capabilities

* API Keys
* AWS Credentials
* Google Cloud Credentials
* JWT Secrets
* GitHub Tokens
* Database Passwords
* OAuth Secrets
* Hardcoded Credentials
* Environment Variables
* Sensitive Configuration Files

### Features

* Public Repository Scanning
* Private Repository Support
* Severity Classification
* File Path Identification
* Line Number Detection
* Multi-File Analysis

---

## 📊 Live Threat Dashboard

Monitor your security posture in real time.

### Dashboard Components

* Live Incident Feed
* Threat Radar
* Risk Score Engine
* Severity Distribution Charts
* Incident Timeline
* Recent Threat Activity
* System Health Metrics
* Database Status Monitoring

---

## 🤖 AI Security Assistant

Integrated cybersecurity copilot powered by Google Gemini.

### Capabilities

* Security Q&A
* Attack Explanations
* Vulnerability Research
* Incident Response Guidance
* Threat Hunting Assistance
* Security Best Practices
* Blue Team Support
* SOC Investigation Help

---

## 📑 Incident Reporting Engine

Generate professional security reports instantly.

### Report Sections

* Executive Summary
* Threat Overview
* Risk Assessment
* Timeline Analysis
* Indicators of Compromise
* Root Cause Analysis
* Remediation Actions
* Recommended Security Controls

### Export Options

* PDF Reports
* Historical Reports
* Executive Briefings

---

# 🏗️ System Architecture

## High-Level Architecture

```text
┌──────────────────────────┐
│      User Uploads        │
│  Logs / GitHub Repos     │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│    Ingestion Layer       │
│ Log Parser & Validator   │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│ Threat Detection Engine  │
│ Pattern Matching Rules   │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│  Severity Classification │
│ Critical / High / Medium │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│   Gemini AI Analysis     │
│ Threat Investigation     │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│ Incident Report Builder  │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│ Dashboard & PDF Export   │
└──────────────────────────┘
```

---

# ⚡ End-to-End Security Workflow

```text
User Uploads Logs
        │
        ▼
Log Ingestion
        │
        ▼
Threat Detection Engine
(SQLi / XSS / Brute Force)
        │
        ▼
Risk Scoring
        │
        ▼
Gemini AI Investigation
        │
        ▼
IOC Extraction
        │
        ▼
Executive Report Generation
        │
        ▼
Dashboard Visualization
        │
        ▼
PDF Export
```

---

# 🧠 AI Investigation Workflow

```text
Raw Security Logs
        │
        ▼
Threat Classification
        │
        ▼
Severity Assessment
        │
        ▼
Context Extraction
        │
        ▼
Gemini AI Analysis
        │
        ▼
Attack Explanation
        │
        ▼
Risk Evaluation
        │
        ▼
Remediation Plan
```

---

# 🔥 Threat Detection Pipeline

ThreatHunter currently detects:

🔴 SQL Injection

🔴 Cross-Site Scripting

🔴 Command Injection

🔴 Directory Traversal

🔴 SSH Brute Force

🔴 Credential Stuffing

🔴 Secret Exposure

🔴 Suspicious User Agents

🔴 Authentication Abuse

🔴 Reconnaissance Attempts

🔴 Rate Limit Violations

🔴 Configuration Leaks

---

# 🛠️ Technology Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Frontend       | Next.js 15              |
| Language       | TypeScript              |
| Styling        | Tailwind CSS v4         |
| AI Engine      | Google Gemini 2.5 Flash |
| Authentication | NextAuth.js             |
| Database       | PostgreSQL              |
| ORM            | Prisma                  |
| Animations     | Framer Motion           |
| Icons          | Lucide React            |
| Notifications  | Sonner                  |
| Deployment     | Vercel                  |

---

# 📂 Project Structure

```bash
threathunter-ai/
│
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── logs/
│   │   ├── reports/
│   │   ├── scanner/
│   │   ├── chat/
│   │   └── api/
│   │
│   ├── components/
│   ├── lib/
│   │   ├── ai/
│   │   ├── scanners/
│   │   └── threat-detection/
│   │
│   └── styles/
│
├── prisma/
├── public/
├── package.json
└── README.md
```

---

# 🚀 Quick Start

## Clone Repository

```bash
git clone https://github.com/Juhamim/threathunder-production.git
cd threathunder-production
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

```env
GEMINI_API_KEY=

NEXTAUTH_URL=

NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

DATABASE_URL=

GITHUB_TOKEN=
```

## Run Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# 🌍 Production Deployment

### Deploy on Vercel

```bash
npm run build
```

Import the repository into Vercel and add all environment variables.

ThreatHunter is fully optimized for:

* Vercel
* PostgreSQL
* Neon Database
* Supabase
* Cloudflare R2
* Google Gemini API

---

# 📸 Screenshots

```md
Landing Page Screenshot

Dashboard Screenshot

Log Analysis Screenshot

GitHub Scanner Screenshot

Incident Reports Screenshot
```

---

# 🎯 Use Cases

### Security Operations Center

Monitor and investigate threats in real time.

### Penetration Testing

Analyze attack traces and identify security weaknesses.

### Security Research

Explore attack patterns and incident trends.

### Cybersecurity Education

Learn SOC workflows and threat analysis.

### Startup Security

Monitor applications without purchasing expensive SIEM platforms.

---

# 🗺️ Future Roadmap

## Version 2.0

* [ ] AI SOC Agent
* [ ] Autonomous Incident Response
* [ ] Malware Detection
* [ ] YARA Rules Engine
* [ ] Sigma Rules Integration
* [ ] Threat Intelligence Feeds
* [ ] SIEM Connectors
* [ ] Splunk Integration
* [ ] ELK Stack Integration
* [ ] Multi-Tenant Organizations
* [ ] Team Collaboration
* [ ] Alert Notifications

---

# 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

Open a Pull Request and help improve ThreatHunter.

---

# 📜 License

MIT License

This project is open-source and free to use, modify, distribute, and self-host.

---

# 👨‍💻 Author

### Juhaim Mohammed

Cybersecurity Engineer • Full Stack Developer • AI Builder

GitHub:
https://github.com/Juhamim

Project Repository:
https://github.com/Juhamim/threathunder-production

Live Application:
https://threathunder-production.vercel.app

---

<div align="center">

## 🛡️ ThreatHunter AI

### Detect Threats. Investigate Faster. Secure Smarter.

Built with ❤️ for the cybersecurity community.

⭐ Star the repository if you find it useful.

</div>
