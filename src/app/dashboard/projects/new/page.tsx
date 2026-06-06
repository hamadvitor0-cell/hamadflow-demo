import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { ProjectForm } from "@/components/forms/project-form";
import { createProjectAction } from "@/server/actions/projects";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const prisma = getPrisma();
  const [clients, proposals, contracts] = await Promise.all([
    prisma.client.findMany({ where: { userId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
    prisma.proposal.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true } }),
    prisma.contract.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true } }),
  ]);

  return (
    <>
      <PageHeader title="Novo projeto" description="Crie um projeto para acompanhar entregas, tarefas e pagamentos." />
      <Card>
        <ProjectForm
          action={createProjectAction}
          clients={clients}
          proposals={proposals}
          contracts={contracts}
          initial={{ clientId: params.clientId, status: "ORCAMENTO", value: 0 }}
        />
      </Card>
    </>
  );
}
