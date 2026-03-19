import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Globe, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";

const frameworks = ["LangChain", "CrewAI", "OpenClaw", "Other"];

const Scan = () => {
  const [tab, setTab] = useState<"upload" | "github">("upload");
  const [framework, setFramework] = useState("LangChain");
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fileName, setFileName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const navigate = useNavigate();

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      navigate("/scan/scan-1");
    }, 3000);
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
                  if (e.dataTransfer.files[0]) setFileName(e.dataTransfer.files[0].name);
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".zip";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) setFileName(file.name);
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
    </AppLayout>
  );
};

export default Scan;
