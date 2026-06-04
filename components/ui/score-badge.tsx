import { cn, getScoreColor, getScoreBg, getScoreLabel } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, showLabel = false, size = "md" }: ScoreBadgeProps) {
  const color = getScoreColor(score);
  const bg = getScoreBg(score);
  const label = getScoreLabel(score);

  const sizeMap = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span className={cn("rounded-full border font-semibold inline-flex items-center gap-1.5", bg, sizeMap[size])}>
      <span className={cn("font-bold tabular-nums", color)}>{score}</span>
      {showLabel && <span className="text-zinc-400 text-xs">{label}</span>}
    </span>
  );
}
