import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { Card, CardHeader } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { projectStatusLabels } from "@/lib/status";
import { CommentForm } from "@/components/forms/comment-form";
import { createPublicCommentAction } from "@/server/actions/comments";

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const prisma = getPrisma();
  const project = await prisma.project.findUnique({
    where: { publicToken: token },
    include: { client: true, tasks: true, payments: true },
  });
  if (!project) notFound();

  const comments = await prisma.comment.findMany({
    where: { entityType: "PROJECT", entityId: project.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-primary">HamadFlow Demo</Link>
        <StatusBadge status={project.status} label={projectStatusLabels[project.status]} />
      </div>
      <Card>
        <p className="text-sm text-muted">{project.client.company || project.client.name}</p>
        <h1 className="mt-3 text-3xl font-semibold">{project.name}</h1>
        <p className="mt-5 text-sm leading-7 text-slate-300">{project.description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-border p-4"><p className="text-xs text-muted">Entrega prevista</p><p className="mt-2"><DateDisplay value={project.dueDate} /></p></div>
          <div className="rounded-md border border-border p-4"><p className="text-xs text-muted">Valor</p><p className="mt-2"><MoneyDisplay value={project.value} /></p></div>
          <div className="rounded-md border border-border p-4"><p className="text-xs text-muted">Tarefas concluídas</p><p className="mt-2 font-mono">{project.tasks.filter((task) => task.status === "CONCLUIDA").length}/{project.tasks.length}</p></div>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.6fr]">
        <Card>
          <CardHeader title="Etapas e tarefas" />
          <div className="grid gap-3">
            {project.tasks.map((task) => (
              <div key={task.id} className="rounded-md border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{task.title}</span>
                  <StatusBadge status={task.status} label={task.status.replace("_", " ").toLowerCase()} />
                </div>
                <p className="mt-2 text-muted">{task.description}</p>
                <p className="mt-2 text-xs text-muted">Prazo: <DateDisplay value={task.dueDate} /></p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Enviar comentário" />
          <CommentForm action={createPublicCommentAction} entityType="PROJECT" publicToken={token} />
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Comentários" />
        <div className="grid gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-border p-3 text-sm">
              <p className="font-medium">{comment.authorName}</p>
              <p className="mt-1 leading-6 text-slate-300">{comment.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
