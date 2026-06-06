import { formatDate } from "@/lib/utils";

export function DateDisplay({ value }: { value?: Date | string | null }) {
  return <span className="text-sm text-slate-300">{formatDate(value)}</span>;
}
