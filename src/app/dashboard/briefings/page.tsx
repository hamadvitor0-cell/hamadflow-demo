import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MoneyDisplay } from "@/components/dashboard/money-display";

export default async function BriefingsPage() {
  const user = await requireUser();
  const briefings = await getPrisma().briefing.findMany({
    where: { userId: user.id },
    include: { client: true, _count: { select: { proposals: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Briefings"
        description="Organize conversas em escopos claros e gere propostas com IA."
        actions={<ButtonLink href="/dashboard/briefings/new"><Plus className="h-4 w-4" /> Novo briefing</ButtonLink>}
      />
      {briefings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum briefing criado"
          description="Cole uma conversa com o cliente e deixe a IA estruturar o escopo."
          href="/dashboard/briefings/new"
          actionLabel="Criar briefing"
        />
      ) : (
        <Card>
          <DataTable headers={["Briefing", "Cliente", "Complexidade", "Faixa sugerida", "Propostas"]}>
            {briefings.map((briefing) => (
              <tr key={briefing.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/briefings/${briefing.id}`} className="font-medium text-primary">
                    {briefing.title}
                  </Link>
                  <p className="text-xs text-muted">{briefing.projectType}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{briefing.client.company || briefing.client.name}</td>
                <td className="px-4 py-3">{briefing.complexity}</td>
                <td className="px-4 py-3">
                  <MoneyDisplay value={briefing.suggestedPriceMin} /> - <MoneyDisplay value={briefing.suggestedPriceMax} />
                </td>
                <td className="px-4 py-3 font-mono">{briefing._count.proposals}</td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </>
  );
}
