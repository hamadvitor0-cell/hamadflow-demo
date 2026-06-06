import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <Card>
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-3/4 rounded bg-white/10" />
      </div>
      <p className="sr-only">{label}</p>
    </Card>
  );
}
