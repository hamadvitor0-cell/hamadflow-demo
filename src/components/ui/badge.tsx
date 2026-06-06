import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-slate-500/25 bg-slate-500/10 text-slate-200",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-100",
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-100",
  info: "border-cyan-400/25 bg-cyan-400/10 text-cyan-100",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
