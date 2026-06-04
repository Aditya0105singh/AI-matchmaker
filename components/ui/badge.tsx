import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-zinc-800 text-zinc-300 border-zinc-700",
        brand: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
        success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
        violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function ClientStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    active: { label: "Active", variant: "success" },
    paused: { label: "Paused", variant: "warning" },
    matched: { label: "Matched", variant: "brand" },
    onboarding: { label: "Onboarding", variant: "info" },
    churned: { label: "Churned", variant: "danger" },
  };
  const config = map[status] || { label: status, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
