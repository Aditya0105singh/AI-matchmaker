"use client";
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary: "bg-linear-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-900/30 hover:from-fuchsia-500 hover:to-violet-500 hover:shadow-fuchsia-800/40 active:scale-[0.98]",
        secondary: "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 active:scale-[0.98]",
        ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:scale-[0.98]",
        destructive: "bg-rose-600/20 text-rose-400 border border-rose-600/30 hover:bg-rose-600/30 hover:text-rose-300",
        success: "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30",
        outline: "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
