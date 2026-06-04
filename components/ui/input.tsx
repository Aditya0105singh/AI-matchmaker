import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-10 rounded-lg bg-zinc-800/60 border text-zinc-100 text-sm placeholder:text-zinc-500 transition-colors",
            "focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/30",
            icon ? "pl-10 pr-4" : "px-4",
            error ? "border-rose-500" : "border-zinc-700 hover:border-zinc-600",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg bg-zinc-800/60 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-500 p-3 transition-colors resize-none",
        "focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/30 hover:border-zinc-600",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
