import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Globe, ScanLine, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

const frameworks = ["LangChain", "CrewAI", "OpenClaw", "Other"];

const Scan = () => {
  const [tab, setTab] = useState<"upload" | "github">("upload");
  const [framework, setFramework] = useState("LangChain");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number; plan: string } | null>(null);

  useEffect(() => {
    const checkUsage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("scans_used_this_month, scan_limit, plan")
          .eq("id", user.id)
          .single();
        if (data) {
          setUsageInfo({ used: data.scans_used_this_month, limit: data.scan_limit, plan: data.plan });
        }
      }
    };
    checkUsage();
  }, []);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScan = async () => {
    // Check usage limit
    if (usageInfo && usageInfo.used >= usageInfo.limit) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setScanning(true);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();

      // Call scan API directly
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      let response: Response;

      if (tab === "github" && githubUrl) {
        // Extract repo name from URL for skill_name
        const repoMatch = githubUrl.match(/github\.com\/[^\/]+\/([^\/]+)/);
        const repoName = repoMatch ? repoMatch[1] : githubUrl;

        response = await fetch(`${supabaseUrl}/functions/v1/scan`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            github_url: githubUrl,
            skill_name: repoName,
            framework,
            source: githubUrl,
          }),
        });
      } else if (tab === "upload" && fileData) {
        // Extract files from zip
        const zip = await JSZip.loadAsync(fileData);
        const filePromises: Promise<void>[] = [];
        const files: Array<{ name: string; content: string }> = [];

        zip.forEach((relativePath, file) => {
          if (!file.dir) {
            filePromises.push(
              file.async("text").then((content) => {
                files.push({ name: relativePath, content });
              })
            );
          }
        });

        await Promise.all(filePromises);

        response = await fetch(`${supabaseUrl}/functions/v1/scan`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            files,
            skill_name: fileName,
            framework,
            source: null,
          }),
        });
      } else {
        throw new Error("No file or URL provided");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scan failed");

      toast({
        title: "Scan complete!",
        description: `Risk score: ${data.risk_score} (${data.risk_level})`,
      });

      if (data.scan_id) {
        navigate(`/scan/${data.scan_id}`);
      } else {
        // No DB save (anonymous), show results inline via state
        navigate(`/scan/result`, { state: { scanData: data } });
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      toast({
        title: "Scan failed",
        description: error.message || "An error occurred during scanning",
        variant: "destructive",
      });
      setScanning(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">New Scan</h1>
        <p className="text-sm text-muted-foreground mb-8">Upload your AI agent code for security analysis</p>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setTab("upload")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "upload" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload Files
          </button>
          <button
            onClick={() => setTab("github")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "github" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            GitHub URL
          </button>
        </div>

        {scanning ? (
          <motion.div
            className="border border-border rounded-[4px] bg-surface p-12 shadow-hard text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative w-full h-24 border border-border rounded-[4px] bg-[#010409] mb-6 overflow-hidden">
              <div className="absolute left-0 right-0 h-[1px] bg-primary animate-scan-line" />
              <div className="flex items-center justify-center h-full">
                <ScanLine className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-foreground font-medium mb-1">Analyzing...</p>
            <p className="text-sm text-muted-foreground font-mono-data">Estimated time: ~30 seconds</p>
          </motion.div>
        ) : (
          <>
            {tab === "upload" ? (
              <div
                className={`border-2 border-dashed rounded-[4px] p-12 text-center transition-colors cursor-pointer ${
                  isDragging ? "border-primary bg-primary/5" : "border-accent hover:border-muted-foreground"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    setFileName(file.name);
                    setFileData(file);
                  }
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".zip";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setFileName(file.name);
                      setFileData(file);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                {fileName ? (
                  <p className="text-foreground font-medium font-mono-data text-sm">{fileName}</p>
                ) : (
                  <>
                    <p className="text-foreground font-medium mb-1">Drop your .zip file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="https://github.com/user/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-surface border border-border rounded-[4px] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono-data"
                />
              </div>
            )}

            {/* Framework selector */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full bg-surface border border-border rounded-[4px] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {frameworks.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full mt-6"
              onClick={handleScan}
              disabled={tab === "upload" ? !fileName : !githubUrl}
            >
              <ScanLine className="w-4 h-4" />
              Scan Now
            </Button>
          </>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md border border-border rounded-[4px] bg-background p-8 shadow-hard"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Scan Limit Reached</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              You've used all <span className="text-foreground font-medium">{usageInfo?.limit}</span> free scans this month. 
              Upgrade to Pro for 100 scans/month + PDF reports + CI/CD integration.
            </p>

            <div className="border border-primary/30 rounded-[4px] bg-primary/5 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg">Pro Plan</span>
                <span className="text-2xl font-bold">$49<span className="text-sm text-muted-foreground font-normal">/mo</span></span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> 100 scans per month</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> PDF compliance reports</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> CI/CD integration (GitHub Actions)</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-primary" /> Email support</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => navigate("/pricing")}
              >
                Upgrade to Pro
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
};

export default Scan;
