import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { publicAppUrl } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmSubmitButton, SubmitButton } from "@/components/ui/submit-button";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { TaskForm } from "@/components/forms/task-form";
import { CommentForm } from "@/components/forms/comment-form";
import { createDashboardCommentAction } from "@/server/actions/comments";
import { deleteProjectAction, deleteTaskAction, updateTaskStatusAction } from "@/server/actions/projects";
import { paymentStatusLabels, projectStatusLabels } from "@/lib/status";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getPrisma().project.findFirst({
    where: { id, userId: user.id },
    include: {
      client: true,
      proposal: true,
      contract: true,
      tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
      payments: { orderBy: { dueDate: "asc" } },
    },
  });
  if (!project) notFound();

  const comments = await getPrisma().comment.findMany({
    where: { entityType: "PROJECT", entityId: project.id },
    orderBy: { createdAt: "desc" },
  });
  const publicUrl = `${publicAppUrl()}/client/project/${project.publicToken}`;
  const groups = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"] as const;

  return (
    <>
      <PageHeader
        title={project.name}
        description={project.client.company || project.client.name}
        actions={
          <>
            <ButtonLink href={`/dashboard/projects/${project.id}/edit`} variant="secondary"><Pencil className="h-4 w-4" /> Editar</ButtonLink>
            <ButtonLink href={publicUrl} variant="secondary"><ExternalLink className="h-4 w-4" /> Link público</ButtonLink>
            <form action={deleteProjectAction}>
              <input type="hidden" name="id" value={project.id} />
              <ConfirmSubmitButton message="Excluir projeto?"><Trash2 className="h-4 w-4" /> Excluir</ConfirmSubmitButton>
            </form>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.4fr]">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} label={projectStatusLabels[project.status]} />
            <span className="text-sm text-muted">Entrega: <DateDisplay value={project.dueDate} /></span>
            <span className="ml-auto text-2xl font-semibold"><MoneyDisplay value={project.value} /></span>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-300">{project.description}</p>
          <div className="mt-5 grid gap-2 text-sm text-muted">
            {project.proposal ? <Link href={`/dashboard/proposals/${project.proposal.id}`} className="text-primary">Proposta: {project.proposal.title}</Link> : null}
            {project.contract ? <Link href={`/dashboard/contracts/${project.contract.id}`} className="text-primary">Contrato: {project.contract.title}</Link> : null}
            {project.links.map((link) => <a key={link} href={link} target="_blank" className="text-primary">{link}</a>)}
          </div>
        </Card>
        <Card>
          <CardHeader title="Pagamentos" action={<ButtonLink href={`/dashboard/payments/new?projectId=${project.id}`} variant="secondary">Novo</ButtonLink>} />
          <div className="grid gap-3">
            {project.payments.map((payment) => (
              <Link key={payment.id} href={`/dashboard/payments/${payment.id}/edit`} className="rounded-md border border-border p-3 text-sm">
                <span className="flex items-center justify-between gap-3">
                  <span>{payment.description}</span>
                  <StatusBadge status={payment.status} label={paymentStatusLabels[payment.status]} />
                </span>
                <span className="mt-2 block text-muted"><MoneyDisplay value={payment.amount} /> - <DateDisplay value={payment.dueDate} /></span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {groups.map((status) => (
          <Card key={status}>
            <CardHeader title={status === "PENDENTE" ? "Pendente" : status === "EM_ANDAMENTO" ? "Em andamento" : "Concluída"} />
            <div className="grid gap-3">
              {project.tasks.filter((task) => task.status === status).map((task) => (
                <div key={task.id} className="rounded-md border border-border bg-white/[0.03] p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-muted">{task.description}</p>
                      <p className="mt-2 text-xs text-muted">Prazo: <DateDisplay value={task.dueDate} /></p>
                    </div>
                    {task.status !== "CONCLUIDA" ? (
                      <form action={updateTaskStatusAction}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="status" value="CONCLUIDA" />
                        <SubmitButton variant="ghost"><CheckCircle2 className="h-4 w-4" /></SubmitButton>
                      </form>
                    ) : null}
                  </div>
                  <form action={deleteTaskAction} className="mt-2">
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <ConfirmSubmitButton message="Excluir tarefa?" variant="ghost">Excluir</ConfirmSubmitButton>
                  </form>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Nova tarefa" />
          <TaskForm projectId={project.id} />
        </Card>
        <Card>
          <CardHeader title="Comentários" />
          <CommentForm action={createDashboardCommentAction} entityType="PROJECT" entityId={project.id} clientId={project.clientId} returnTo={`/dashboard/projects/${project.id}`} />
          <div className="mt-5 grid gap-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-md border border-border bg-white/[0.03] p-3 text-sm">
                <p className="font-medium">{comment.authorName}</p>
                <p className="mt-1 leading-6 text-slate-300">{comment.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
