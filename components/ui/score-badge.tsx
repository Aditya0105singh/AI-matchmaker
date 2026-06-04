import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ScoreBadge({ score, showLabel = false, size = "sm" }: ScoreBadgeProps) {
  const color =
    score >= 80 ? "text-green-700 bg-green-50 border-green-200" :
    score >= 60 ? "text-amber-700 bg-amber-50 border-amber-200" :
                  "text-red-700 bg-red-50 border-red-200";

  const label =
    score >= 85 ? "Excellent" :
    score >= 75 ? "Strong"    :
    score >= 65 ? "Good"      :
    score >= 50 ? "Fair"      : "Low";

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded border font-medium tabular-nums",
      size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-0.5",
      color
    )}>
      {score}%
      {showLabel && <span className="text-[10px] opacity-70">{label}</span>}
    </span>
  );
}
