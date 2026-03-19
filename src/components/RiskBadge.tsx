interface RiskBadgeProps {
  score: number;
  size?: "sm" | "lg";
}

const RiskBadge = ({ score, size = "sm" }: RiskBadgeProps) => {
  const color = score > 60 ? "text-danger text-glow-danger" : score > 30 ? "text-caution text-glow-caution" : "text-safe text-glow-safe";
  const label = score > 60 ? "DANGEROUS" : score > 30 ? "CAUTION" : "SAFE";
  
  return (
    <span className={`font-mono-data font-bold tabular-nums ${color} ${size === "lg" ? "text-4xl" : "text-sm"}`}>
      {score.toString().padStart(3, "0")}
      {size === "sm" && <span className="ml-1.5 text-xs opacity-70">{label}</span>}
    </span>
  );
};

export default RiskBadge;
