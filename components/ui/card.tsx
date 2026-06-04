import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4 border-b border-zinc-800", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 py-4 border-t border-zinc-800 flex items-center gap-3", className)}
      {...props}
    />
  );
}

export function KpiCard({
  label,
  value,
  icon,
  delta,
  variant = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  delta?: string;
  variant?: "default" | "brand" | "success" | "warning";
}) {
  const variantStyles = {
    default: "from-zinc-800/50 to-zinc-900/50 border-zinc-700/50",
    brand: "from-fuchsia-900/20 to-violet-900/20 border-fuchsia-700/30",
    success: "from-emerald-900/20 to-teal-900/20 border-emerald-700/30",
    warning: "from-amber-900/20 to-orange-900/20 border-amber-700/30",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">{label}</span>
        <span className="text-zinc-500">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-zinc-100">{value}</span>
        {delta && (
          <span className="text-xs text-emerald-400 mb-1">{delta}</span>
        )}
      </div>
    </div>
  );
}
