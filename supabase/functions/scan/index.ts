import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Pattern definitions (ported from patterns.py)
interface Pattern {
  name: string;
  category: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  weight: number;
  regex: string;
  description: string;
}

interface Finding {
  file_path: string;
  line_number: number;
  pattern_name: string;
  category: string;
  severity: string;
  weight: number;
  description: string;
  code_snippet: string;
}

const NETWORK_PATTERNS: Pattern[] = [
  {
    name: "external_http_post",
    category: "network",
    severity: "HIGH",
    weight: 25,
    regex: "(fetch|axios|request|curl|wget).*(POST|post).*http[s]?://",
    description: "HTTP POST to external URL (potential data exfiltration)",
  },
  {
    name: "fetch_call",
    category: "network",
    severity: "MEDIUM",
    weight: 15,
    regex: "\\b(fetch|axios|requests\\.post|requests\\.get|urllib\\.request)\\s*\\(",
    description: "Network request detected",
  },
  {
    name: "curl_command",
    category: "network",
    severity: "MEDIUM",
    weight: 15,
    regex: "\\bcurl\\s+(-[A-Za-z]+\\s+)*http[s]?://",
    description: "curl command to external URL",
  },
  {
    name: "wget_command",
    category: "network",
    severity: "MEDIUM",
    weight: 15,
    regex: "\\bwget\\s+(-[A-Za-z]+\\s+)*http[s]?://",
    description: "wget command to external URL",
  },
];

const CREDENTIAL_PATTERNS: Pattern[] = [
  {
    name: "env_token_access",
    category: "credential",
    severity: "HIGH",
    weight: 20,
    regex: "(process\\.env|os\\.getenv|ENV)\\[?['\"][\\w_]*(TOKEN|KEY|SECRET|PASSWORD|API_KEY)['\"]?\\]?",
    description: "Accesses credential from environment variables",
  },
  {
    name: "credential_file_read",
    category: "credential",
    severity: "HIGH",
    weight: 20,
    regex: "(readFile|open|cat|read).*(/.ssh|/.aws|/.config|credentials|\\.env)",
    description: "Reads credential files",
  },
  {
    name: "password_in_code",
    category: "credential",
    severity: "MEDIUM",
    weight: 15,
    regex: "(password|passwd|pwd)\\s*[=:]\\s*['\"][^'\"]{3,}['\"]",
    description: "Hardcoded password detected",
  },
];

const SHELL_PATTERNS: Pattern[] = [
  {
    name: "shell_exec",
    category: "shell",
    severity: "HIGH",
    weight: 15,
    regex: "\\b(exec|execSync|spawn|spawnSync|system|popen|subprocess\\.run|subprocess\\.call)\\s*\\(",
    description: "Shell command execution",
  },
  {
    name: "shell_injection_risk",
    category: "shell",
    severity: "HIGH",
    weight: 15,
    regex: "(exec|system|popen)\\s*\\([^)]*\\+[^)]*\\)",
    description: "Shell command with string concatenation (injection risk)",
  },
  {
    name: "bash_command",
    category: "shell",
    severity: "MEDIUM",
    weight: 10,
    regex: "\\b(bash|sh|zsh)\\s+-c\\s+",
    description: "Direct bash command execution",
  },
];

const FILE_DESTRUCTION_PATTERNS: Pattern[] = [
  {
    name: "rm_rf",
    category: "file_destruction",
    severity: "HIGH",
    weight: 15,
    regex: "\\brm\\s+-[rfRF]*\\s+",
    description: "Recursive file deletion (rm -rf)",
  },
  {
    name: "unlink_call",
    category: "file_destruction",
    severity: "MEDIUM",
    weight: 10,
    regex: "\\b(unlink|unlinkSync|rmdir|rmdirSync|fs\\.rm)\\s*\\(",
    description: "File/directory deletion",
  },
  {
    name: "shutil_rmtree",
    category: "file_destruction",
    severity: "HIGH",
    weight: 15,
    regex: "\\bshutil\\.rmtree\\s*\\(",
    description: "Recursive directory deletion (Python)",
  },
];

const OBFUSCATION_PATTERNS: Pattern[] = [
  {
    name: "eval_call",
    category: "obfuscation",
    severity: "HIGH",
    weight: 15,
    regex: "\\beval\\s*\\(",
    description: "Dynamic code execution (eval) - code injection risk",
  },
  {
    name: "function_constructor",
    category: "obfuscation",
    severity: "HIGH",
    weight: 15,
    regex: "\\bFunction\\s*\\(",
    description: "Dynamic function creation - code injection risk",
  },
  {
    name: "base64_decode",
    category: "obfuscation",
    severity: "MEDIUM",
    weight: 10,
    regex: "\\b(atob|Buffer\\.from|base64\\.b64decode)\\s*\\(",
    description: "Base64 decoding (possible obfuscated payload)",
  },
  {
    name: "hex_decode",
    category: "obfuscation",
    severity: "MEDIUM",
    weight: 10,
    regex: "(\\\\x[0-9a-fA-F]{2}){10,}",
    description: "Hex-encoded string (possible obfuscation)",
  },
];

const ALL_PATTERNS: Pattern[] = [
  ...NETWORK_PATTERNS,
  ...CREDENTIAL_PATTERNS,
  ...SHELL_PATTERNS,
  ...FILE_DESTRUCTION_PATTERNS,
  ...OBFUSCATION_PATTERNS,
];

const SEVERITY_WEIGHTS: Record<string, number> = {
  HIGH: 1.0,
  MEDIUM: 0.6,
  LOW: 0.3,
};

const URL_PATTERN = /https?:\/\/[^\s'"<>]+/g;

const SAFE_DOMAINS = [
  "api.openai.com",
  "api.anthropic.com",
  "api.cohere.ai",
  "api.github.com",
  "registry.npmjs.org",
  "pypi.org",
  "clawhub.com",
  "localhost",
  "127.0.0.1",
];

function extractUrls(content: string): string[] {
  const matches = content.match(URL_PATTERN);
  return matches ? Array.from(new Set(matches)) : [];
}

function isSafeDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    return SAFE_DOMAINS.some((safe) => domain.includes(safe));
  } catch {
    return false;
  }
}

function scanFiles(
  files: Array<{ name: string; content: string }>
): {
  findings: Finding[];
  urls: Array<{ url: string; is_safe: boolean }>;
  files_scanned: number;
  lines_scanned: number;
} {
  const findings: Finding[] = [];
  const allUrls: string[] = [];
  let filesScanned = 0;
  let linesScanned = 0;

  for (const file of files) {
    filesScanned++;
    const lines = file.content.split("\n");
    linesScanned += lines.length;

    // Extract URLs
    allUrls.push(...extractUrls(file.content));

    // Pattern matching
    lines.forEach((line, index) => {
      for (const pattern of ALL_PATTERNS) {
        const regex = new RegExp(pattern.regex, "i");
        if (regex.test(line)) {
          findings.push({
            file_path: file.name,
            line_number: index + 1,
            pattern_name: pattern.name,
            category: pattern.category,
            severity: pattern.severity,
            weight: pattern.weight,
            description: pattern.description,
            code_snippet: line.trim(),
          });
        }
      }
    });
  }

  const uniqueUrls = Array.from(new Set(allUrls)).map((url) => ({
    url,
    is_safe: isSafeDomain(url),
  }));

  return {
    findings,
    urls: uniqueUrls,
    files_scanned: filesScanned,
    lines_scanned: linesScanned,
  };
}

function calculateRiskScore(findings: Finding[]): number {
  if (findings.length === 0) return 0;

  const totalWeight = findings.reduce((sum, f) => {
    return sum + f.weight * SEVERITY_WEIGHTS[f.severity];
  }, 0);

  return Math.min(100, Math.floor(totalWeight));
}

function getRiskLevel(score: number): string {
  if (score <= 30) return "SAFE";
  if (score <= 60) return "CAUTION";
  return "DANGEROUS";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const files = body.files;
    const skillName = body.skill_name || body.name || "Unknown";
    const framework = body.framework || null;
    const source = body.source || null;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files provided" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Run scan
    const startTime = Date.now();
    const result = scanFiles(files);
    const duration = Date.now() - startTime;
    const riskScore = calculateRiskScore(result.findings);
    const riskLevel = getRiskLevel(riskScore);

    // Try to save to DB if user is authenticated
    let scanId: string | null = null;

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "") || "";

      if (token) {
        const { data: userData } = await supabase.auth.getUser(token);
        if (userData?.user) {
          const userId = userData.user.id;

          const { data: scan } = await supabase
            .from("scans")
            .insert({
              user_id: userId,
              skill_name: skillName,
              source,
              risk_score: riskScore,
              risk_level: riskLevel,
              findings_count: result.findings.length,
              findings: result.findings,
              urls: result.urls,
              files_scanned: result.files_scanned,
              lines_scanned: result.lines_scanned,
              framework,
              scan_duration_ms: duration,
            })
            .select("id")
            .single();

          if (scan) {
            scanId = scan.id;
            await supabase.rpc("increment_scan_count", { p_user_id: userId }).catch(() => {});
          }
        }
      }
    } catch (dbErr) {
      console.error("DB save error (non-fatal):", dbErr);
    }

    return new Response(
      JSON.stringify({
        scan_id: scanId,
        skill_name: skillName,
        risk_score: riskScore,
        risk_level: riskLevel,
        findings_count: result.findings.length,
        findings: result.findings,
        urls: result.urls,
        files_scanned: result.files_scanned,
        lines_scanned: result.lines_scanned,
        scan_duration_ms: duration,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Scan error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
