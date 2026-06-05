import { auth } from "@/auth";
import { scanContentForSecrets, SecretFinding } from "@/lib/scanners/secrets";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface GitHubFile {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
  size: number;
}

const SCAN_EXTENSIONS = [
  ".js", ".ts", ".jsx", ".tsx", ".py", ".env", ".json",
  ".yaml", ".yml", ".sh", ".bash", ".php", ".rb", ".go",
  ".java", ".cs", ".cpp", ".c", ".rs", ".toml", ".ini",
  ".conf", ".config", ".properties",
];

const SKIP_DIRS = ["node_modules", ".git", "dist", "build", ".next", "vendor", "__pycache__"];

async function fetchGitHubTree(owner: string, repo: string, token?: string): Promise<GitHubFile[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ThreatHunter-AI",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers }
  );

  if (!treeRes.ok) {
    const err = await treeRes.json().catch(() => ({}));
    throw new Error(err.message ?? `GitHub API error: ${treeRes.status}`);
  }

  const treeData = await treeRes.json();

  return (treeData.tree ?? [])
    .filter((item: any) => {
      if (item.type !== "blob") return false;
      if (item.size > 200000) return false; // skip files > 200KB
      const parts = item.path.split("/");
      if (parts.some((p: string) => SKIP_DIRS.includes(p))) return false;
      const ext = item.path.includes(".") ? "." + item.path.split(".").pop() : "";
      return SCAN_EXTENSIONS.includes(ext.toLowerCase()) || item.path.includes(".env");
    })
    .map((item: any) => ({
      name: item.path.split("/").pop() ?? item.path,
      path: item.path,
      type: "file",
      download_url: `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${item.path}`,
      size: item.size,
    }))
    .slice(0, 150); // limit to 150 files per scan
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoUrl, githubToken } = await req.json();

  if (!repoUrl) {
    return NextResponse.json({ error: "Repository URL required" }, { status: 400 });
  }

  // Parse GitHub URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (!match) {
    return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
  }

  const [, owner, repo] = match;
  const token = githubToken || process.env.GITHUB_TOKEN;

  try {
    const files = await fetchGitHubTree(owner, repo, token);

    if (files.length === 0) {
      return NextResponse.json({
        success: true,
        repo: `${owner}/${repo}`,
        filesScanned: 0,
        findings: [],
        summary: "No scannable files found.",
      });
    }

    const allFindings: SecretFinding[] = [];
    let filesScanned = 0;

    // Scan files in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (file) => {
          if (!file.download_url) return;
          try {
            const res = await fetch(file.download_url, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) return;
            const content = await res.text();
            filesScanned++;
            const findings = scanContentForSecrets(content, file.path);
            allFindings.push(...findings);
          } catch { /* skip failed files */ }
        })
      );
    }

    // Deduplicate by file+line
    const unique = allFindings.filter((f, i, arr) =>
      arr.findIndex(x => x.file === f.file && x.line === f.line) === i
    );

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    unique.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return NextResponse.json({
      success: true,
      repo: `${owner}/${repo}`,
      filesScanned,
      totalFiles: files.length,
      findings: unique,
      summary: unique.length === 0
        ? "✅ No secrets detected in scanned files."
        : `⚠️ Found ${unique.length} potential secret(s) in ${filesScanned} files.`,
      stats: {
        critical: unique.filter(f => f.severity === "critical").length,
        high: unique.filter(f => f.severity === "high").length,
        medium: unique.filter(f => f.severity === "medium").length,
      },
    });

  } catch (error: any) {
    console.error("GitHub scan error:", error);
    return NextResponse.json(
      { error: error.message ?? "Scan failed. Check the repository URL and try again." },
      { status: 500 }
    );
  }
}
