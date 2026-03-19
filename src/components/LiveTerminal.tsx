import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const lines = [
  { text: "[INIT] AgentShield v2.4.1", color: "text-muted-foreground" },
  { text: "[LOAD] Importing plugin.py...", color: "text-foreground" },
  { text: "[SCAN] Analyzing AST structure...", color: "text-foreground" },
  { text: "[SCAN] Checking 1,482 lines...", color: "text-foreground" },
  { text: "[SCAN] Inspecting outbound URLs...", color: "text-caution" },
  { text: "[WARN] Suspicious URL: http://exfil.evil.corp/collect", color: "text-caution" },
  { text: "[CRITICAL] Unauthorized API access detected in agent.py:142", color: "text-danger" },
  { text: "[CRITICAL] Prompt injection vector found in handler.py:89", color: "text-danger" },
  { text: "[INFO] 3 critical vulnerabilities found", color: "text-danger" },
  { text: "[DONE] Risk Score: 78/100 — DANGEROUS", color: "text-danger" },
];

const LiveTerminal = () => {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (visibleLines < lines.length) {
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, 400 + Math.random() * 300);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setVisibleLines(0), 3000);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines]);

  return (
    <div className="w-full max-w-2xl border border-border rounded-[4px] bg-[#010409] shadow-hard overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface">
        <div className="w-3 h-3 rounded-full bg-danger/60" />
        <div className="w-3 h-3 rounded-full bg-caution/60" />
        <div className="w-3 h-3 rounded-full bg-safe/60" />
        <span className="ml-2 text-xs text-muted-foreground font-mono-data">agentshield — scan</span>
      </div>
      <div className="p-4 font-mono-data text-sm min-h-[320px]">
        {lines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={`${line.color} leading-relaxed`}
          >
            {line.text}
          </motion.div>
        ))}
        {visibleLines < lines.length && (
          <span className="inline-block w-2 h-4 bg-primary animate-terminal-blink" />
        )}
      </div>
    </div>
  );
};

export default LiveTerminal;
