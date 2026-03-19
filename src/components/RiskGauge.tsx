import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
}

const RiskGauge = ({ score }: RiskGaugeProps) => {
  const color = score > 60 ? "hsl(0, 84%, 60%)" : score > 30 ? "hsl(45, 93%, 47%)" : "hsl(142, 70%, 50%)";
  const label = score > 60 ? "DANGEROUS" : score > 30 ? "CAUTION" : "SAFE";
  const labelClass = score > 60 ? "text-danger text-glow-danger" : score > 30 ? "text-caution text-glow-caution" : "text-safe text-glow-safe";
  
  const radius = 90;
  const circumference = Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="220" height="130" viewBox="0 0 220 130">
        <path
          d="M 20 120 A 90 90 0 0 1 200 120"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <motion.path
          d="M 20 120 A 90 90 0 0 1 200 120"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
        />
        <text x="110" y="100" textAnchor="middle" className="font-mono-data text-3xl font-bold" fill={color}>
          {score}
        </text>
        <text x="110" y="120" textAnchor="middle" className="text-xs" fill="hsl(var(--muted-foreground))">
          / 100
        </text>
      </svg>
      <span className={`font-mono-data font-bold text-lg ${labelClass}`}>{label}</span>
    </div>
  );
};

export default RiskGauge;
