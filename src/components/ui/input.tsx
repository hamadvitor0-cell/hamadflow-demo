import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-2 text-sm", className)}>
      <span className="font-medium text-slate-200">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-muted">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "focus-ring h-11 rounded-md border border-border bg-slate-950/50 px-3 text-sm text-foreground placeholder:text-slate-500",
        className,
      )}
      {...props}
    />
  );
}
