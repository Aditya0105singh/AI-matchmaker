"use client";
import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors duration-100 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:     "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950",
        secondary:   "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100",
        ghost:       "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        danger:      "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
        success:     "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
        outline:     "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
        link:        "text-blue-600 hover:underline p-0 h-auto",
      },
      size: {
        sm:      "h-7 px-2.5 text-xs",
        md:      "h-8 px-3",
        lg:      "h-9 px-4",
        xl:      "h-10 px-5 text-base",
        icon:    "h-8 w-8 p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
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
        {loading && (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
