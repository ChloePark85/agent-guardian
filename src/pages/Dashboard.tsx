import { Link } from "react-router-dom";
import { Plus, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import RiskBadge from "@/components/RiskBadge";

const mockScans = [
  { id: "scan-1", name: "my-langchain-agent.zip", score: 78, findings: 5, date: "2026-03-18", framework: "LangChain" },
  { id: "scan-2", name: "crewai-plugin-v2.zip", score: 42, findings: 3, date: "2026-03-17", framework: "CrewAI" },
  { id: "scan-3", name: "safe-tool.zip", score: 12, findings: 0, date: "2026-03-15", framework: "OpenClaw" },
  { id: "scan-4", name: "data-fetcher.zip", score: 65, findings: 4, date: "2026-03-14", framework: "LangChain" },
];

const Dashboard = () => {
  const scansUsed = 7;
  const scanLimit = 10;
  const plan = "Free";

  return (
    <AppLayout>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor your AI agent security posture</p>
          </div>
          <Link to="/scan">
            <Button variant="hero" className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Usage Bar */}
        <div className="border border-border rounded-[4px] bg-surface p-4 mb-6 sm:mb-8 shadow-hard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              <span className="font-mono-data text-foreground">{scansUsed}/{scanLimit}</span> scans used
            </span>
            <span className="text-xs font-mono-data bg-accent px-2 py-0.5 rounded-[4px] text-accent-foreground">{plan}</span>
          </div>
          <div className="h-1 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(scansUsed / scanLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Scan History */}
        <div className="border border-border rounded-[4px] bg-surface shadow-hard overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold">Scan History</h2>
          </div>
          {mockScans.length === 0 ? (
            <div className="py-20 text-center">
              <ScanLine className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No scans yet. Run your first scan!</p>
              <Link to="/scan">
                <Button variant="hero" className="mt-4">Start Scanning</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Framework</th>
                      <th className="px-4 py-3 font-medium">Risk Score</th>
                      <th className="px-4 py-3 font-medium">Findings</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockScans.map((scan) => (
                      <tr key={scan.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <Link to={`/scan/${scan.id}`} className="text-foreground hover:text-primary transition-colors font-medium">
                            {scan.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono-data text-xs">{scan.framework}</td>
                        <td className="px-4 py-3"><RiskBadge score={scan.score} /></td>
                        <td className="px-4 py-3 font-mono-data text-muted-foreground">{scan.findings}</td>
                        <td className="px-4 py-3 font-mono-data text-muted-foreground text-xs">{scan.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-border">
                {mockScans.map((scan) => (
                  <Link key={scan.id} to={`/scan/${scan.id}`} className="block p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground truncate mr-2">{scan.name}</span>
                      <RiskBadge score={scan.score} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono-data">{scan.framework}</span>
                      <span>{scan.findings} findings</span>
                      <span className="font-mono-data">{scan.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
