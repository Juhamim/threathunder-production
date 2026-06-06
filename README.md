# ThreatHunter AI

**AI-Powered Security Operations Center — Open Source, Free, No Account Required**

Live Demo: https://threathunder-production.vercel.app
GitHub: https://github.com/Juhamim/threathunder-production

---

## What is ThreatHunter?

ThreatHunter is an open-source cybersecurity platform built for security analysts, developers, 
and students who need to detect threats, investigate logs, and generate professional incident 
reports — without paying for expensive commercial SOC tools.

It combines a real-time threat detection heuristics engine with Google Gemini AI to analyze 
logs, scan GitHub repositories for leaked secrets, generate executive-grade incident reports, 
and provide an interactive AI security assistant — all from a single browser interface.

No data leaves your environment unless you configure external API keys. Everything runs 
locally or on your own Vercel deployment.

---

## Features

### Log Analysis
- Upload Nginx, Apache, or Auth log files in plain text format
- Heuristics engine scans for SQL Injection, Cross-Site Scripting, SSH Brute Force,
  Directory Traversal, Command Injection, and authentication anomalies
- Severity classification: Critical, High, Medium, Low
- Gemini AI generates a full incident analysis with attack explanation, impact assessment,
  indicators of compromise (IOCs), and remediation steps
- Export reports as PDF

### GitHub Secret Scanner
- Scan any public or private GitHub repository
- Detects exposed API keys, tokens, credentials, hardcoded passwords, and
  security misconfigurations across the entire commit tree and all files
- Supports private repositories with a GitHub Personal Access Token
- Findings categorized by severity with file path and line number

### Live Threat Dashboard
- Real-time incident feed showing all detected threats
- Tactical attack radar map with geographic threat origin visualization
- Severity breakdown charts (Critical / High / Medium / Low)
- System health monitor: database status, latency, heuristics engine status
- Metric cards: total logs scanned, threats flagged, critical alerts, risk score

### AI Security Assistant
- Streaming chat interface powered by Gemini 2.5 Flash
- Expert cybersecurity Q&A: attack techniques, vulnerability explanations, 
  remediation guidance, and security concepts
- Context-aware responses for both beginners and senior analysts
- Automatic model fallback: gemini-2.5-flash → gemini-2.0-flash-lite → gemini-1.5-flash-8b

### Incident Reports
- View all historical scan reports in the Reports section
- Full AI-generated incident reports with executive summary, threat overview, 
  risk assessment, timeline, IOCs, and recommended actions
- Export to PDF for stakeholder sharing

---

## Technology Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| Framework      | Next.js 15 (App Router)                         |
| Language       | TypeScript                                      |
| Styling        | Tailwind CSS v4 + Custom CSS Design System      |
| AI Provider    | Google Gemini API (gemini-2.5-flash)            |
| Authentication | NextAuth.js (Google OAuth)                      |
| Database       | Prisma ORM + PostgreSQL (Neon / Supabase)       |
| Animations     | Framer Motion                                   |
| Icons          | Lucide React                                    |
| Notifications  | Sonner (toast system)                           |
| Deployment     | Vercel                                          |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Google Gemini API key (free at https://aistudio.google.com)
- A PostgreSQL database (Neon free tier recommended: https://neon.tech)
- Google OAuth credentials (for authentication)

### 1. Clone the Repository

    git clone https://github.com/Juhamim/threathunder-production.git
    cd threathunder-production

### 2. Install Dependencies

    npm install

### 3. Configure Environment Variables

Create a file called .env.local in the project root and add the following:

    # Google Gemini AI
    GEMINI_API_KEY=your_gemini_api_key_here

    # NextAuth Authentication
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_nextauth_secret_here

    # Google OAuth (from Google Cloud Console)
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # PostgreSQL Database (Neon, Supabase, or any Postgres provider)
    DATABASE_URL=postgresql://user:password@host/database?sslmode=require

To generate NEXTAUTH_SECRET, run:

    openssl rand -base64 32

### 4. Set Up the Database

    npx prisma generate
    npx prisma db push

### 5. Run the Development Server

    npm run dev

Open http://localhost:3000 in your browser.

### 6. Build for Production

    npm run build
    npm start

---

## Deployment on Vercel

1. Push your repository to GitHub
2. Go to https://vercel.com and import the repository
3. Add the same environment variables from your .env.local in the Vercel project settings
4. Deploy

The application will be live on your Vercel URL automatically.

For Google OAuth to work in production:
- Go to Google Cloud Console → Credentials
- Add your Vercel production URL to "Authorized redirect URIs":
  https://your-app.vercel.app/api/auth/callback/google

---

## API Routes

| Route                     | Method | Description                              |
|---------------------------|--------|------------------------------------------|
| /api/upload               | POST   | Upload and analyze a log file            |
| /api/analyze              | POST   | Run heuristics on uploaded log data      |
| /api/threats              | GET    | Retrieve stored threat records           |
| /api/threats/[id]         | GET    | Get a single threat by ID                |
| /api/dashboard/stats      | GET    | Fetch dashboard metrics and recent data  |
| /api/scan/github          | POST   | Scan a GitHub repository for secrets     |
| /api/reports              | GET    | List all generated incident reports      |
| /api/reports/[id]         | GET    | Get a specific report                    |
| /api/reports/[id]/pdf     | GET    | Export a report as PDF                   |
| /api/reports/export       | POST   | Batch export reports                     |
| /api/ai/chat              | POST   | Stream AI assistant responses            |
| /api/auth/[...nextauth]   | ANY    | NextAuth authentication handlers         |

---

## Project Structure

    threathunder-production/
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/                  # Sign-in page
    │   │   ├── (dashboard)/             # Protected app pages
    │   │   │   ├── layout.tsx           # Sidebar + topbar shell
    │   │   │   ├── dashboard/           # Main dashboard page
    │   │   │   ├── logs/                # Log upload and analysis
    │   │   │   ├── threats/             # Threat list and investigation
    │   │   │   ├── reports/             # Incident reports viewer
    │   │   │   ├── scanner/             # GitHub secret scanner
    │   │   │   └── chat/                # AI assistant chat
    │   │   ├── api/                     # Backend API routes
    │   │   ├── globals.css              # Global design system
    │   │   ├── layout.tsx               # Root HTML layout
    │   │   └── page.tsx                 # Public landing page
    │   ├── lib/
    │   │   ├── ai/
    │   │   │   └── gemini.ts            # Gemini AI integration
    │   │   ├── scanners/
    │   │   │   └── secrets.ts           # Secret detection engine
    │   │   └── threat-detection.ts      # Heuristics engine
    │   └── components/
    │       └── common/
    │           └── LivingBackground.tsx # Animated canvas background
    ├── prisma/
    │   └── schema.prisma                # Database schema
    ├── .env.local                       # Local environment variables
    ├── package.json
    └── README.md

---

## Threat Detection Rules

The heuristics engine currently detects the following threat types:

- SQL Injection (SQLi) — Union selects, comment-based payloads, error-based probes
- Cross-Site Scripting (XSS) — Script tags, event handlers, JavaScript URIs
- SSH Brute Force — Repeated authentication failures from a single IP
- Directory Traversal — Path traversal sequences (../, %2e%2e)
- Command Injection — Shell metacharacters and OS command patterns
- Credential Stuffing — High-volume login attempts across multiple accounts
- Suspicious User Agents — Known attack tool signatures (sqlmap, nikto, etc.)
- Rate Limit Violations — Abnormal request frequency from a single source

---

## Environment Variables Reference

| Variable              | Required | Description                                    |
|-----------------------|----------|------------------------------------------------|
| GEMINI_API_KEY        | Yes      | Google Gemini API key for AI features          |
| NEXTAUTH_URL          | Yes      | Full URL of your app (localhost or production) |
| NEXTAUTH_SECRET       | Yes      | Random secret for session encryption           |
| GOOGLE_CLIENT_ID      | Yes      | Google OAuth client ID                         |
| GOOGLE_CLIENT_SECRET  | Yes      | Google OAuth client secret                     |
| DATABASE_URL          | Yes      | PostgreSQL connection string                   |
| GITHUB_TOKEN          | No       | GitHub token for scanning private repositories |

---

## Contributing

Contributions are welcome and appreciated.

1. Fork the repository
2. Create a new branch:
       git checkout -b feature/your-feature-name
3. Make your changes and commit:
       git commit -m "feat: add your feature description"
4. Push to your fork:
       git push origin feature/your-feature-name
5. Open a Pull Request on GitHub

Please follow the existing code style and add comments for complex logic.
For major changes, open an issue first to discuss the approach.

---

## License

This project is licensed under the MIT License.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
copies of this software, with or without modification, subject to the following condition:

The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

Full license text: https://opensource.org/licenses/MIT

---

## Author

**Juhaim Mohammed**

- GitHub: https://github.com/Juhamim
- Email: juhaimmtm@gmail.com
- Project Repository: https://github.com/Juhamim/threathunder-production
- Live Application: https://threathunder-production.vercel.app

---

## Acknowledgements

- Google Gemini AI for powering threat analysis and the AI assistant
- Vercel for hosting and deployment infrastructure
- Next.js team for the application framework
- Prisma for database tooling
- The open-source security community for inspiration and research

---

*ThreatHunter AI — Built in the open. Inspect the code. Own your security.*
