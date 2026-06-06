import Link from "next/link";
import { FileSignature, Plus } from "lucide-react";
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
import { contractStatusLabels } from "@/lib/status";

export default async function ContractsPage() {
  const user = await requireUser();
  const contracts = await getPrisma().contract.findMany({
    where: { userId: user.id },
    include: { client: true, proposal: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Contratos"
        description="Contratos editáveis com aviso jurídico, PDF e aceite digital simples."
        actions={<ButtonLink href="/dashboard/contracts/new"><Plus className="h-4 w-4" /> Novo contrato</ButtonLink>}
      />
      {contracts.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="Nenhum contrato criado"
          description="Gere um contrato a partir de uma proposta ou crie manualmente."
          href="/dashboard/contracts/new"
          actionLabel="Criar contrato"
        />
      ) : (
        <Card>
          <DataTable headers={["Contrato", "Cliente", "Status", "Aceite", "Valor"]}>
            {contracts.map((contract) => (
              <tr key={contract.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/contracts/${contract.id}`} className="font-medium text-primary">
                    {contract.title}
                  </Link>
                  {contract.proposal ? <p className="text-xs text-muted">{contract.proposal.title}</p> : null}
                </td>
                <td className="px-4 py-3 text-slate-300">{contract.client.company || contract.client.name}</td>
                <td className="px-4 py-3"><StatusBadge status={contract.status} label={contractStatusLabels[contract.status]} /></td>
                <td className="px-4 py-3"><DateDisplay value={contract.acceptedAt} /></td>
                <td className="px-4 py-3"><MoneyDisplay value={contract.totalPrice} /></td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </>
  );
}
