import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, className, showLabel }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const color =
    clamped >= 80 ? "bg-green-500" :
    clamped >= 60 ? "bg-amber-500" :
                    "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex-1 h-1 bg-gray-200 rounded-full overflow-hidden", className)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 tabular-nums w-7 text-right">{clamped}%</span>
      )}
    </div>
  );
}

export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 3,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamped / 100) * circ;
  const color =
    clamped >= 80 ? "#16A34A" :
    clamped >= 60 ? "#F59E0B" :
                    "#DC2626";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-gray-700">{clamped}</span>
    </div>
  );
}
