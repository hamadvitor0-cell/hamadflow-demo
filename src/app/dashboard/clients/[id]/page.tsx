import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefcaseBusiness, ClipboardList, FileText, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  contractStatusLabels,
  projectStatusLabels,
  proposalStatusLabels,
} from "@/lib/status";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const client = await getPrisma().client.findFirst({
    where: { id, userId: user.id },
    include: {
      briefings: { orderBy: { createdAt: "desc" } },
      proposals: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
      projects: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { dueDate: "desc" } },
    },
  });

  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={client.company || client.name}
        description={`${client.name} - ${client.email}`}
        actions={
          <>
            <ButtonLink href={`/dashboard/clients/${client.id}/edit`} variant="secondary">
              <Pencil className="h-4 w-4" /> Editar
            </ButtonLink>
            <ButtonLink href={`/dashboard/briefings/new?clientId=${client.id}`} variant="secondary">
              <ClipboardList className="h-4 w-4" /> Novo briefing
            </ButtonLink>
            <ButtonLink href={`/dashboard/proposals/new?clientId=${client.id}`} variant="secondary">
              <FileText className="h-4 w-4" /> Nova proposta
            </ButtonLink>
            <ButtonLink href={`/dashboard/projects/new?clientId=${client.id}`}>
              <BriefcaseBusiness className="h-4 w-4" /> Novo projeto
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardHeader title="Dados do cliente" />
          <dl className="grid gap-3 text-sm">
            <div><dt className="text-muted">WhatsApp</dt><dd>{client.phone || "-"}</dd></div>
            <div><dt className="text-muted">CPF/CNPJ</dt><dd>{client.document || "-"}</dd></div>
            <div><dt className="text-muted">Origem</dt><dd>{client.source}</dd></div>
            <div><dt className="text-muted">Tipo</dt><dd>{client.type}</dd></div>
            <div><dt className="text-muted">Observações</dt><dd className="leading-6">{client.notes || "-"}</dd></div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Projetos vinculados" />
          <DataTable headers={["Projeto", "Status", "Entrega", "Valor"]}>
            {client.projects.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/projects/${project.id}`} className="text-primary">{project.name}</Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={project.status} label={projectStatusLabels[project.status]} /></td>
                <td className="px-4 py-3"><DateDisplay value={project.dueDate} /></td>
                <td className="px-4 py-3"><MoneyDisplay value={project.value} /></td>
              </tr>
            ))}
          </DataTable>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader title="Briefings" />
          <div className="grid gap-3 text-sm">
            {client.briefings.map((briefing) => (
              <Link key={briefing.id} href={`/dashboard/briefings/${briefing.id}`} className="rounded-md border border-border p-3 text-primary">
                {briefing.title}
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Propostas" />
          <div className="grid gap-3 text-sm">
            {client.proposals.map((proposal) => (
              <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`} className="rounded-md border border-border p-3">
                <span className="block text-primary">{proposal.title}</span>
                <span className="mt-2 block"><StatusBadge status={proposal.status} label={proposalStatusLabels[proposal.status]} /></span>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Contratos e pagamentos" />
          <div className="grid gap-3 text-sm">
            {client.contracts.map((contract) => (
              <Link key={contract.id} href={`/dashboard/contracts/${contract.id}`} className="rounded-md border border-border p-3">
                <span className="block text-primary">{contract.title}</span>
                <span className="mt-2 block"><StatusBadge status={contract.status} label={contractStatusLabels[contract.status]} /></span>
              </Link>
            ))}
            {client.payments.map((payment) => (
              <Link key={payment.id} href={`/dashboard/payments/${payment.id}/edit`} className="rounded-md border border-border p-3">
                <span className="block">{payment.description}</span>
                <span className="text-muted"><MoneyDisplay value={payment.amount} /> vence <DateDisplay value={payment.dueDate} /></span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
