import { MailCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { leadStatusLabels } from "@/lib/status";

export default async function LeadsPage() {
  const user = await requireUser();
  const leads = await getPrisma().lead.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      convertedClient: { select: { name: true, company: true } },
      convertedBriefing: { select: { id: true } },
      convertedProposal: { select: { id: true } },
      convertedProject: { select: { id: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Pedidos do site"
        description="Pedidos fictícios recebidos ou criados apenas no banco da demonstração."
      />
      {leads.length === 0 ? (
        <EmptyState
          icon={MailCheck}
          title="Nenhum pedido demo"
          description="Envie um POST de teste para /api/public/portfolio-request."
        />
      ) : (
        <Card>
          <DataTable headers={["Pedido", "Status", "Projeto", "Orçamento", "Origem", "Workflow"]}>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-primary">{lead.companyName || lead.name}</p>
                  <p className="text-xs text-muted">{lead.email || lead.phone || "Contato não informado"}</p>
                  <p className="mt-1 text-xs text-slate-400"><DateDisplay value={lead.createdAt} /></p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} label={leadStatusLabels[lead.status]} />
                </td>
                <td className="px-4 py-3 text-slate-300">{lead.projectName}</td>
                <td className="px-4 py-3 text-slate-300">{lead.budgetRange || "Não informado"}</td>
                <td className="px-4 py-3 text-slate-300">{lead.source}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  Cliente {lead.convertedClient ? "OK" : "-"} · Briefing {lead.convertedBriefing ? "OK" : "-"} ·
                  Proposta {lead.convertedProposal ? "OK" : "-"} · Projeto {lead.convertedProject ? "OK" : "-"}
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </>
  );
}
