import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:  "bg-gray-100 text-gray-700",
        outline:  "border border-gray-300 text-gray-600",
        success:  "bg-green-50 text-green-700",
        warning:  "bg-amber-50 text-amber-700",
        danger:   "bg-red-50 text-red-700",
        info:     "bg-blue-50 text-blue-700",
        purple:   "bg-purple-50 text-purple-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-gray-500":   variant === "default" || variant === "outline",
          "bg-green-500":  variant === "success",
          "bg-amber-500":  variant === "warning",
          "bg-red-500":    variant === "danger",
          "bg-blue-500":   variant === "info",
          "bg-purple-500": variant === "purple",
        })} />
      )}
      {children}
    </span>
  );
}

const STATUS_MAP: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
  active:      { label: "Active",      variant: "success" },
  paused:      { label: "Paused",      variant: "default" },
  matched:     { label: "Matched",     variant: "info"    },
  onboarding:  { label: "Onboarding",  variant: "warning" },
  churned:     { label: "Churned",     variant: "danger"  },
};

export function ClientStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
