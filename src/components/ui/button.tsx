import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function buttonStyles(variant: Variant = "primary", className?: string) {
  return cn(
    "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" &&
      "bg-primary text-slate-950 shadow-[0_0_30px_rgba(50,210,200,0.18)] hover:bg-primary-2",
    variant === "secondary" &&
      "border border-border bg-white/5 text-foreground hover:border-primary/50 hover:bg-white/10",
    variant === "ghost" && "text-muted hover:bg-white/8 hover:text-foreground",
    variant === "danger" &&
      "border border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20",
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}

export function ButtonLink({
  className,
  variant = "primary",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string }) {
  return <Link href={href} className={buttonStyles(variant, className)} {...props} />;
}
