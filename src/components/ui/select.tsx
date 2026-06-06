import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "focus-ring h-11 rounded-md border border-border bg-slate-950/70 px-3 text-sm text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
