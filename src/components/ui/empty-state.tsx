import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="grid min-h-56 place-items-center text-center">
      <div className="max-w-md">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-border bg-white/5 text-primary">
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        {href && actionLabel ? (
          <ButtonLink href={href} className="mt-5">
            {actionLabel}
          </ButtonLink>
        ) : null}
      </div>
    </Card>
  );
}
