import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, FileCode, Clock, AlertTriangle, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import RiskGauge from "@/components/RiskGauge";
import { supabase, type Scan } from "@/lib/supabase";
import { useEffect, useState } from "react";

const severityColor: Record<string, string> = {
  HIGH: "bg-danger/10 text-danger border-danger/20",
  MEDIUM: "bg-caution/10 text-caution border-caution/20",
  LOW: "bg-muted text-muted-foreground border-border",
};

const ScanResult = () => {
  const { id } = useParams();
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScan();
  }, [id]);

  const loadScan = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setScan(data);
    } catch (error) {
      console.error('Error loading scan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!scan) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Scan not found</p>
          <Link to="/dashboard">
            <Button variant="hero" className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 truncate">{scan.skill_name}</h1>
            <p className="text-sm text-muted-foreground font-mono-data">{scan.framework || 'N/A'} · {id}</p>
          </div>
          <Button variant="outline" disabled className="gap-2 relative group shrink-0">
            <Download className="w-4 h-4" />
            Download PDF
            <Lock className="w-3 h-3" />
            <span className="absolute -top-8 right-0 text-xs bg-accent px-2 py-0.5 rounded-[4px] text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Pro+ only
            </span>
          </Button>
        </div>

        {/* Risk Gauge + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="border border-border rounded-[4px] bg-surface p-6 sm:p-8 shadow-hard flex justify-center">
            <RiskGauge score={scan.risk_score} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: "Files Scanned", value: scan.files_scanned, icon: FileCode },
              { label: "Lines Scanned", value: scan.lines_scanned.toLocaleString(), icon: FileCode },
              { label: "Findings", value: scan.findings_count, icon: AlertTriangle },
              { label: "Duration", value: `${(scan.scan_duration_ms / 1000).toFixed(1)}s`, icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="border border-border rounded-[4px] bg-surface p-3 sm:p-4 shadow-hard">
                <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1">
                  <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <span className="text-lg sm:text-xl font-bold font-mono-data">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Findings */}
        {scan.findings && scan.findings.length > 0 && (
          <div className="border border-border rounded-[4px] bg-surface shadow-hard overflow-hidden mb-6 sm:mb-8">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Findings</h2>
            </div>
            <div className="divide-y divide-border">
              {scan.findings.map((f, i) => (
                <div key={i} className="p-3 sm:p-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span className={`text-xs font-bold font-mono-data px-2 py-0.5 rounded-[4px] border ${severityColor[f.severity]}`}>
                      {f.severity}
                    </span>
                    <span className="text-xs sm:text-sm font-mono-data text-muted-foreground">
                      {f.file_path}:{f.line_number}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{f.description}</p>
                  {f.code_snippet && (
                    <div className="bg-[#010409] border border-border rounded-[4px] p-2 sm:p-3 font-mono-data text-xs overflow-x-auto">
                      <div className={`${f.severity === "HIGH" ? "bg-danger/10 border-l-2 border-danger" : ""} px-2 py-1`}>
                        <span className="text-muted-foreground mr-2 sm:mr-3">{f.line_number}</span>
                        <span className="text-foreground">{f.code_snippet}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* URL Analysis */}
        {scan.urls && scan.urls.length > 0 && (
          <div className="border border-border rounded-[4px] bg-surface shadow-hard overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">URL Analysis</h2>
            </div>
            <div className="divide-y divide-border">
              {scan.urls.map((u, i) => (
                <div key={i} className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs sm:text-sm font-mono-data truncate">{u.url}</span>
                  </div>
                  <span className={`text-xs font-bold font-mono-data px-2 py-0.5 rounded-[4px] shrink-0 ${
                    u.is_safe ? "bg-safe/10 text-safe" : "bg-danger/10 text-danger"
                  }`}>
                    {u.is_safe ? "SAFE" : "UNSAFE"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ScanResult;
