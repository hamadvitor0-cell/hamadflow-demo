import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  children,
  className,
}: {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-full overflow-x-auto rounded-lg border border-border", className)}>
      <table className="w-full min-w-[640px] divide-y divide-border text-sm">
        <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-[0.1em] text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface/40">{children}</tbody>
      </table>
    </div>
  );
}
