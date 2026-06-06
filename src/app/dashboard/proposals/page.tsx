import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { proposalStatusLabels } from "@/lib/status";

export default async function ProposalsPage() {
  const user = await requireUser();
  const proposals = await getPrisma().proposal.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Propostas"
        description="Crie, edite, envie, exporte em PDF e compartilhe propostas por link público."
        actions={<ButtonLink href="/dashboard/proposals/new"><Plus className="h-4 w-4" /> Nova proposta</ButtonLink>}
      />
      {proposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma proposta criada"
          description="Gere uma proposta a partir de um briefing ou crie manualmente."
          href="/dashboard/proposals/new"
          actionLabel="Criar proposta"
        />
      ) : (
        <Card>
          <DataTable headers={["Proposta", "Cliente", "Status", "Validade", "Valor"]}>
            {proposals.map((proposal) => (
              <tr key={proposal.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/proposals/${proposal.id}`} className="font-medium text-primary">
                    {proposal.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{proposal.client.company || proposal.client.name}</td>
                <td className="px-4 py-3"><StatusBadge status={proposal.status} label={proposalStatusLabels[proposal.status]} /></td>
                <td className="px-4 py-3"><DateDisplay value={proposal.validUntil} /></td>
                <td className="px-4 py-3"><MoneyDisplay value={proposal.totalPrice} /></td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </>
  );
}
