import Link from "next/link";
import { notFound } from "next/navigation";
import { Copy, Download, ExternalLink, FileSignature, Pencil, Rocket, Send, Trash2 } from "lucide-react";
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
import { proposalStatusLabels } from "@/lib/status";
import {
  convertProposalToProjectAction,
  deleteProposalAction,
  duplicateProposalAction,
  generateContractFromProposalAction,
  markProposalSentAction,
} from "@/server/actions/proposals";
import { CommentForm } from "@/components/forms/comment-form";
import { createDashboardCommentAction } from "@/server/actions/comments";

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </div>
  );
}

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const proposal = await getPrisma().proposal.findFirst({
    where: { id, userId: user.id },
    include: {
      client: true,
      contracts: true,
      projects: true,
    },
  });
  if (!proposal) notFound();

  const comments = await getPrisma().comment.findMany({
    where: { entityType: "PROPOSAL", entityId: proposal.id },
    orderBy: { createdAt: "desc" },
  });
  const publicUrl = `${publicAppUrl()}/client/proposal/${proposal.publicToken}`;

  return (
    <>
      <PageHeader
        title={proposal.title}
        description={proposal.client.company || proposal.client.name}
        actions={
          <>
            <ButtonLink href={`/dashboard/proposals/${proposal.id}/preview`} variant="secondary"><ExternalLink className="h-4 w-4" /> Preview</ButtonLink>
            <ButtonLink href={`/api/proposals/${proposal.id}/pdf`} variant="secondary"><Download className="h-4 w-4" /> Baixar PDF</ButtonLink>
            <ButtonLink href={`/dashboard/proposals/${proposal.id}/edit`} variant="secondary"><Pencil className="h-4 w-4" /> Editar</ButtonLink>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.38fr]">
        <Card>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={proposal.status} label={proposalStatusLabels[proposal.status]} />
            <span className="text-sm text-muted">Validade: <DateDisplay value={proposal.validUntil} /></span>
            <span className="ml-auto text-2xl font-semibold"><MoneyDisplay value={proposal.totalPrice} /></span>
          </div>
          <p className="text-sm leading-7 text-slate-300">{proposal.summary}</p>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <List title="Escopo incluso" items={proposal.includedScope} />
            <List title="Fora do escopo" items={proposal.excludedScope} />
            <List title="Entregáveis" items={proposal.deliverables} />
            <List title="Etapas" items={proposal.milestones} />
          </div>
          <div className="mt-8 rounded-lg border border-border bg-white/[0.03] p-4 text-sm leading-7">
            <p><strong>Prazo:</strong> {proposal.timeline}</p>
            <p><strong>Pagamento:</strong> {proposal.paymentTerms}</p>
            {proposal.notes ? <p><strong>Observações:</strong> {proposal.notes}</p> : null}
          </div>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader title="Ações" />
            <div className="grid gap-3">
              <form action={markProposalSentAction}><input type="hidden" name="id" value={proposal.id} /><SubmitButton variant="secondary"><Send className="h-4 w-4" /> Marcar enviada</SubmitButton></form>
              <form action={duplicateProposalAction}><input type="hidden" name="id" value={proposal.id} /><SubmitButton variant="secondary"><Copy className="h-4 w-4" /> Duplicar</SubmitButton></form>
              <form action={generateContractFromProposalAction}><input type="hidden" name="id" value={proposal.id} /><SubmitButton><FileSignature className="h-4 w-4" /> Gerar contrato</SubmitButton></form>
              <form action={convertProposalToProjectAction}><input type="hidden" name="id" value={proposal.id} /><SubmitButton variant="secondary"><Rocket className="h-4 w-4" /> Converter em projeto</SubmitButton></form>
              <form action={deleteProposalAction}><input type="hidden" name="id" value={proposal.id} /><ConfirmSubmitButton message="Excluir proposta?"><Trash2 className="h-4 w-4" /> Excluir</ConfirmSubmitButton></form>
            </div>
          </Card>
          <Card>
            <CardHeader title="Link público" />
            <Link href={publicUrl} className="break-all text-sm text-primary" target="_blank">
              {publicUrl}
            </Link>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader title="Comentários" />
        <CommentForm action={createDashboardCommentAction} entityType="PROPOSAL" entityId={proposal.id} clientId={proposal.clientId} returnTo={`/dashboard/proposals/${proposal.id}`} />
        <div className="mt-5 grid gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-border bg-white/[0.03] p-3 text-sm">
              <p className="font-medium">{comment.authorName}</p>
              <p className="mt-1 leading-6 text-slate-300">{comment.content}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
