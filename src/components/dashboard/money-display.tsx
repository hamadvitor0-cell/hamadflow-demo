import { formatMoney } from "@/lib/utils";

export function MoneyDisplay({
  value,
  currency,
}: {
  value: unknown;
  currency?: string;
}) {
  return <span className="font-mono text-sm tabular-nums">{formatMoney(value, currency)}</span>;
}
