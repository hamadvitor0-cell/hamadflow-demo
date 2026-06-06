import {
  AlertTriangle,
  Banknote,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  MailCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DemoResetButton } from "@/components/dashboard/demo-reset-button";
import {
  leadStatusLabels,
  projectStatusLabels,
  proposalStatusLabels,
} from "@/lib/status";
import { formatMoney } from "@/lib/utils";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { isDemoResetEnabled } from "@/lib/demo";

export default async function DashboardPage() {
  const user = await requireUser();
  const prisma = getPrisma();
  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + 7);

  const [
    siteLeads,
    clients,
    briefings,
    activeProjects,
    pendingProposals,
    waitingContracts,
    pendingPayments,
    revenueForecast,
    overduePayments,
    recentLeads,
    recentProjects,
    recentProposals,
    nextTasks,
  ] = await Promise.all([
    prisma.lead.count({ where: { userId: user.id, source: "demo" } }),
    prisma.client.count({ where: { userId: user.id } }),
    prisma.briefing.count({ where: { userId: user.id } }),
    prisma.project.count({
      where: { userId: user.id, status: { notIn: ["FINALIZADO", "CANCELADO"] } },
    }),
    prisma.proposal.count({
      where: { userId: user.id, status: { in: ["ENVIADA", "VISUALIZADA", "RASCUNHO"] } },
    }),
    prisma.contract.count({
      where: { userId: user.id, status: { in: ["ENVIADO", "AGUARDANDO_ACEITE"] } },
    }),
    prisma.payment.aggregate({
      where: { userId: user.id, status: { in: ["PENDENTE", "ATRASADO"] } },
      _sum: { amount: true },
    }),
    prisma.proposal.aggregate({
      where: { userId: user.id, status: { in: ["ENVIADA", "VISUALIZADA", "APROVADA"] } },
      _sum: { totalPrice: true },
    }),
    prisma.payment.count({
      where: {
        userId: user.id,
        OR: [{ status: "ATRASADO" }, { status: "PENDENTE", dueDate: { lt: today } }],
      },
    }),
    prisma.lead.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.project.findMany({
      where: { userId: user.id },
      include: { client: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.proposal.findMany({
      where: { userId: user.id },
      include: { client: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        userId: user.id,
        status: { not: "CONCLUIDA" },
        dueDate: { lte: soon },
      },
      include: { project: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão demonstrativa de pedidos, clientes, propostas, contratos, projetos e pagamentos."
        actions={isDemoResetEnabled() ? <DemoResetButton /> : null}
      />

      <div className="mb-6 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.08] p-4 text-sm leading-6 text-cyan-50">
        <strong>Ambiente demonstrativo com dados fictícios.</strong> Nenhuma informação enviada
        aqui vai para o workflow real de Vitor Hamad.
        <span className="ml-2 text-cyan-200">IA demo: respostas simuladas para apresentação.</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pedidos do site" value={String(siteLeads)} icon={MailCheck} />
        <StatCard label="Clientes" value={String(clients)} icon={Users} />
        <StatCard label="Briefings" value={String(briefings)} icon={ClipboardList} />
        <StatCard label="Projetos ativos" value={String(activeProjects)} icon={BriefcaseBusiness} />
        <StatCard label="Propostas pendentes" value={String(pendingProposals)} icon={FileText} />
        <StatCard label="Contratos aguardando aceite" value={String(waitingContracts)} icon={FileSignature} />
        <StatCard label="Pagamentos pendentes" value={formatMoney(pendingPayments._sum.amount)} icon={CreditCard} />
        <StatCard label="Receita prevista" value={formatMoney(revenueForecast._sum.totalPrice)} icon={Banknote} />
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader title="Pedidos recentes" description="Leads fictícios criados no ambiente demo." />
          <DataTable headers={["Pedido", "Status", "Projeto", "Orçamento", "Data"]}>
            {recentLeads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-3">
                  <Link href="/dashboard/leads" className="font-medium text-primary">
                    {lead.companyName || lead.name}
                  </Link>
                  <p className="text-xs text-muted">{lead.email || lead.phone || "Contato não informado"}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} label={leadStatusLabels[lead.status]} />
                </td>
                <td className="px-4 py-3 text-slate-300">{lead.projectName}</td>
                <td className="px-4 py-3 text-slate-300">{lead.budgetRange}</td>
                <td className="px-4 py-3"><DateDisplay value={lead.createdAt} /></td>
              </tr>
            ))}
          </DataTable>
        </Card>

        <Card>
          <CardHeader title="Projetos recentes" description="Status e entregas em andamento." />
          <DataTable headers={["Projeto", "Cliente", "Status", "Entrega", "Valor"]}>
            {recentProjects.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/projects/${project.id}`} className="font-medium text-primary">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{project.client.company || project.client.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} label={projectStatusLabels[project.status]} />
                </td>
                <td className="px-4 py-3"><DateDisplay value={project.dueDate} /></td>
                <td className="px-4 py-3"><MoneyDisplay value={project.value} /></td>
              </tr>
            ))}
          </DataTable>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.55fr]">
        <Card>
          <CardHeader title="Propostas recentes" />
          <DataTable headers={["Proposta", "Cliente", "Status", "Validade", "Valor"]}>
            {recentProposals.map((proposal) => (
              <tr key={proposal.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/proposals/${proposal.id}`} className="font-medium text-primary">
                    {proposal.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{proposal.client.company || proposal.client.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={proposal.status} label={proposalStatusLabels[proposal.status]} />
                </td>
                <td className="px-4 py-3"><DateDisplay value={proposal.validUntil} /></td>
                <td className="px-4 py-3"><MoneyDisplay value={proposal.totalPrice} /></td>
              </tr>
            ))}
          </DataTable>
        </Card>

        <Card>
          <CardHeader title="Alertas demo" description="Resumo calculado a partir do pipeline fictício." />
          <div className="grid gap-3">
            <div className="rounded-md border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-100">
              {pendingProposals} propostas aguardando resposta.
            </div>
            <div className="rounded-md border border-cyan-400/25 bg-cyan-400/10 p-3 text-sm text-cyan-100">
              {nextTasks.length} tarefa(s) vencem nos próximos 7 dias.
            </div>
            <div className="rounded-md border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-100">
              <AlertTriangle className="mr-2 inline h-4 w-4" />
              {overduePayments} pagamento(s) fictício(s) em atraso.
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
