# ThreatHunter AI 🛡️

> **AI-Powered Security Operations Center** — Detect threats, analyze logs, and generate professional incident reports with Gemini 2.5 Flash.

![ThreatHunter AI Banner](https://img.shields.io/badge/ThreatHunter-AI-blue?style=for-the-badge&logo=shield&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange?style=for-the-badge&logo=google)

---

## 📋 Overview

ThreatHunter AI is a production-grade SaaS cybersecurity platform that helps students, security enthusiasts, and junior analysts:

- **Upload** Apache, Nginx, Syslog, auth, CSV, and generic text logs
- **Detect** 7+ threat types with rule-based pattern matching
- **Analyze** findings with Gemini 2.5 Flash AI — plain English explanations
- **Generate** professional PDF-ready incident reports
- **Chat** with an AI security analyst (streaming, session memory)
- **Scan** GitHub repositories for exposed secrets and API keys

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Log Analysis** | Parse Apache, Nginx, Syslog, auth.log, CSV, and plain text |
| ⚡ **Threat Detection** | 7 rule-based detectors: brute force, SQLi, XSS, traversal, stuffing, bots, privilege escalation |
| 🤖 **AI Analysis** | Gemini 2.5 Flash explains threats in beginner-friendly and professional terms |
| 📊 **SOC Dashboard** | Real-time charts: threat trends, log volume, attack categories, risk gauge |
| 📄 **Incident Reports** | AI-generated reports with executive summary, IoCs, timeline, remediation steps |
| 💬 **AI Chat** | Streaming SOC assistant with session memory |
| 🔐 **GitHub Scanner** | Detect AWS keys, OpenAI keys, DB URLs, JWTs, SSH keys, and more |
| 🎯 **Risk Scoring** | 0–100 risk score based on threat severity and frequency |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js 15 App                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Landing    │  │  Dashboard   │  │  API Routes   │  │
│  │  Page       │  │  (Auth'd)    │  │               │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  ┌──────────┐      ┌──────────────┐    ┌──────────────┐
  │  Neon    │      │  Gemini API  │    │ Cloudflare   │
  │ Postgres │      │  2.5 Flash   │    │     R2       │
  └──────────┘      └──────────────┘    └──────────────┘
        ▲
  ┌─────┴──────┐
  │  DrizzleORM │
  └────────────┘
```

**Tech Stack:**
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **UI**: Framer Motion, Recharts, Radix UI, Lucide Icons
- **Auth**: NextAuth.js v5 + Google OAuth 2.0
- **Database**: Neon PostgreSQL + Drizzle ORM
- **AI**: Google Gemini 2.5 Flash
- **Storage**: Cloudflare R2 (S3-compatible)
- **Deployment**: Vercel

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Google Cloud account (for OAuth)
- Neon account (free tier)
- Google AI Studio account (for Gemini key)

### 1. Clone & Install

```bash
cd threathunter-ai
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# NextAuth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (from console.cloud.google.com)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Neon PostgreSQL (from neon.tech)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Cloudflare R2 (from cloudflare.com/r2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-key-id
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=threathunter-logs

# Gemini AI (from aistudio.google.com)
GEMINI_API_KEY=your-gemini-api-key

# Optional: GitHub scanning
GITHUB_TOKEN=ghp_your-token
```

### 3. Initialize Database

Run the SQL migration on your Neon database:
```bash
# Copy src/db/migrations/001_init.sql and run in Neon SQL Editor
# Or use Drizzle:
npm run db:push
```

### 4. Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → APIs & Services → OAuth consent screen
3. Credentials → Create OAuth 2.0 Client ID → Web application
4. Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID & Secret to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/sign-in/          # Google OAuth sign-in page
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── layout.tsx           # Sidebar + topbar shell
│   │   ├── dashboard/           # Main SOC dashboard
│   │   ├── logs/                # Log upload & analysis
│   │   ├── threats/             # Threat intelligence
│   │   ├── reports/             # Incident reports
│   │   ├── chat/                # AI chat assistant
│   │   └── scanner/             # GitHub secret scanner
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── analyze/             # Log analysis endpoint
│   │   ├── ai/chat/             # Streaming chat endpoint
│   │   ├── scan/github/         # GitHub scanner endpoint
│   │   └── reports/[id]/        # Report detail endpoint
│   ├── globals.css              # Full cybersecurity dark theme
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── auth.ts                      # NextAuth v5 config
├── middleware.ts                 # Route protection
├── db/
│   ├── schema.ts                # Drizzle schema (all tables)
│   ├── index.ts                 # DB client
│   └── migrations/001_init.sql  # SQL migration
└── lib/
    ├── ai/gemini.ts             # Gemini 2.5 Flash integration
    ├── parsers/index.ts         # Log format parsers
    ├── threat-detection/        # Detection engine (7 rules)
    └── scanners/secrets.ts      # Secret detection patterns
```

---

## 🔒 Security

- All API routes verify session before processing
- File uploads limited to 10MB, text files only
- Secrets redacted in scanner output (shown as `***REDACTED***`)
- Environment variables never exposed to client
- Input validation on all endpoints
- OWASP-aligned threat detection rules

---

## 🗺️ Roadmap

- [ ] Cloudflare R2 actual file storage integration
- [ ] Real-time threat monitoring via WebSockets
- [ ] Custom detection rule builder
- [ ] Team collaboration & project sharing
- [ ] SIEM integrations (Splunk, ElasticSearch)
- [ ] CVE database correlation
- [ ] Automated remediation playbooks
- [ ] Mobile app (React Native)

---

## 👥 Developer & Repository Info

This project is developed and maintained by **Juhamim** (juhaimmtm@gmail.com).

- **Official Git Repository:** [Juhamim/threathunder-production](https://github.com/Juhamim/threathunder-production.git)
- **Developer Profile:** [@Juhamim](https://github.com/Juhamim)

## 📄 License

MIT © 2026 ThreatHunter AI - Developed by Juhamim.

---

*Built for the security community by Juhamim. Not a substitute for professional security assessment.*

