import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card className="min-h-32 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
          {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
        </div>
        <span className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}
