import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "focus-ring min-h-28 rounded-md border border-border bg-slate-950/50 px-3 py-3 text-sm leading-6 text-foreground placeholder:text-slate-500",
        className,
      )}
      {...props}
    />
  );
}
