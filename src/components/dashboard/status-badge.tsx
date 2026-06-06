import { Badge } from "@/components/ui/badge";
import { statusTone } from "@/lib/status";

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  return <Badge tone={statusTone(status)}>{label ?? status}</Badge>;
}
