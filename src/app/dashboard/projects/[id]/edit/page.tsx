import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { ProjectForm } from "@/components/forms/project-form";
import { updateProjectAction } from "@/server/actions/projects";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const prisma = getPrisma();
  const [project, clients, proposals, contracts] = await Promise.all([
    prisma.project.findFirst({ where: { id, userId: user.id } }),
    prisma.client.findMany({ where: { userId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
    prisma.proposal.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true } }),
    prisma.contract.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { id: true, title: true } }),
  ]);
  if (!project) notFound();

  return (
    <>
      <PageHeader title="Editar projeto" description={project.name} />
      <Card>
        <ProjectForm action={updateProjectAction} clients={clients} proposals={proposals} contracts={contracts} initial={project} />
      </Card>
    </>
  );
}
