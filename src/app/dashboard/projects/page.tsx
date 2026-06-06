import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";
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
import { projectStatusLabels } from "@/lib/status";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await getPrisma().project.findMany({
    where: { userId: user.id },
    include: { client: true, _count: { select: { tasks: true, payments: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Projetos"
        description="Acompanhe execução, tarefas, pagamentos, comentários e área pública do cliente."
        actions={<ButtonLink href="/dashboard/projects/new"><Plus className="h-4 w-4" /> Novo projeto</ButtonLink>}
      />
      {projects.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="Nenhum projeto criado"
          description="Converta uma proposta aprovada ou crie o primeiro projeto manualmente."
          href="/dashboard/projects/new"
          actionLabel="Criar projeto"
        />
      ) : (
        <Card>
          <DataTable headers={["Projeto", "Cliente", "Status", "Entrega", "Valor", "Tarefas"]}>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/projects/${project.id}`} className="font-medium text-primary">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{project.client.company || project.client.name}</td>
                <td className="px-4 py-3"><StatusBadge status={project.status} label={projectStatusLabels[project.status]} /></td>
                <td className="px-4 py-3"><DateDisplay value={project.dueDate} /></td>
                <td className="px-4 py-3"><MoneyDisplay value={project.value} /></td>
                <td className="px-4 py-3 font-mono">{project._count.tasks}</td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </>
  );
}
