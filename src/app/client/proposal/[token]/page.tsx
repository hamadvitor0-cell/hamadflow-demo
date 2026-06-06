import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { proposalStatusLabels } from "@/lib/status";
import {
  approvePublicProposalAction,
  rejectPublicProposalAction,
} from "@/server/actions/proposals";
import { CommentForm } from "@/components/forms/comment-form";
import { createPublicCommentAction } from "@/server/actions/comments";

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const prisma = getPrisma();
  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    include: { client: true, user: true, contracts: true, projects: true },
  });
  if (!proposal) notFound();

  if (proposal.status === "ENVIADA") {
    await prisma.proposal.update({ where: { id: proposal.id }, data: { status: "VISUALIZADA" } });
    proposal.status = "VISUALIZADA";
  }

  const comments = await prisma.comment.findMany({
    where: { entityType: "PROPOSAL", entityId: proposal.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-semibold text-primary">HamadFlow Demo</Link>
        <ButtonLink href={`/api/public/proposals/${token}/pdf`} variant="secondary">
          <Download className="h-4 w-4" /> Baixar PDF
        </ButtonLink>
      </div>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
          <div>
            <p className="text-sm text-muted">{proposal.user.brandName}</p>
            <h1 className="mt-3 text-3xl font-semibold">{proposal.title}</h1>
            <p className="mt-2 text-sm text-muted">{proposal.client.company || proposal.client.name}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={proposal.status} label={proposalStatusLabels[proposal.status]} />
            <p className="mt-4 text-3xl font-semibold"><MoneyDisplay value={proposal.totalPrice} /></p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-7 text-slate-300">{proposal.summary}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            ["Escopo incluso", proposal.includedScope],
            ["Fora do escopo", proposal.excludedScope],
            ["Entregáveis", proposal.deliverables],
            ["Etapas", proposal.milestones],
          ].map(([title, items]) => (
            <section key={title as string}>
              <h2 className="font-semibold">{title as string}</h2>
              <ul className="mt-3 grid gap-2 text-sm text-slate-300">
                {(items as string[]).map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-border bg-white/[0.03] p-4 text-sm leading-7">
          <p><strong>Prazo:</strong> {proposal.timeline}</p>
          <p><strong>Pagamento:</strong> {proposal.paymentTerms}</p>
          <p><strong>Validade:</strong> <DateDisplay value={proposal.validUntil} /></p>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Responder proposta" />
          {proposal.status === "APROVADA" ? (
            <div className="text-sm leading-7 text-emerald-100">
              Proposta aprovada. {proposal.contracts[0] ? <Link className="text-primary" href={`/client/contract/${proposal.contracts[0].publicToken}`}>Ver contrato</Link> : "O freelancer poderá gerar o contrato."}
            </div>
          ) : (
            <div className="grid gap-4">
              <form action={approvePublicProposalAction}>
                <input type="hidden" name="token" value={token} />
                <SubmitButton> Aprovar proposta </SubmitButton>
              </form>
              <form action={rejectPublicProposalAction} className="grid gap-3">
                <input type="hidden" name="token" value={token} />
                <Field label="Motivo da recusa">
                  <Textarea name="reason" />
                </Field>
                <SubmitButton variant="danger">Recusar proposta</SubmitButton>
              </form>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="Enviar comentário" />
          <CommentForm action={createPublicCommentAction} entityType="PROPOSAL" publicToken={token} />
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
