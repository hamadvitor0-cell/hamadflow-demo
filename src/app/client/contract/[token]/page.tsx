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
import { contractStatusLabels } from "@/lib/status";
import {
  acceptPublicContractAction,
  rejectPublicContractAction,
} from "@/server/actions/contracts";
import { CommentForm } from "@/components/forms/comment-form";
import { createPublicCommentAction } from "@/server/actions/comments";

export default async function PublicContractPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const prisma = getPrisma();
  const contract = await prisma.contract.findUnique({
    where: { publicToken: token },
    include: { client: true, user: true, projects: true },
  });
  if (!contract) notFound();

  const comments = await prisma.comment.findMany({
    where: { entityType: "CONTRACT", entityId: contract.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-semibold text-primary">HamadFlow Demo</Link>
        <ButtonLink href={`/api/public/contracts/${token}/pdf`} variant="secondary">
          <Download className="h-4 w-4" /> Baixar PDF
        </ButtonLink>
      </div>
      <Card>
        <div className="flex flex-wrap justify-between gap-5 border-b border-border pb-6">
          <div>
            <p className="text-sm text-muted">{contract.user.brandName}</p>
            <h1 className="mt-3 text-3xl font-semibold">{contract.title}</h1>
            <p className="mt-2 text-sm text-muted">{contract.client.company || contract.client.name}</p>
          </div>
          <div className="text-right">
            <StatusBadge status={contract.status} label={contractStatusLabels[contract.status]} />
            <p className="mt-4 text-3xl font-semibold"><MoneyDisplay value={contract.totalPrice} /></p>
          </div>
        </div>
        <div className="mt-6 rounded-lg border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          {contract.legalDisclaimer}
        </div>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-300">
          <p><strong>Contratado:</strong> {contract.contractorData}</p>
          <p><strong>Contratante:</strong> {contract.clientData}</p>
          <p><strong>Objeto:</strong> {contract.object}</p>
          <p><strong>Escopo:</strong> {contract.scope}</p>
          <p><strong>Pagamento:</strong> {contract.paymentTerms}</p>
          <p><strong>Prazo:</strong> {contract.deadline}</p>
          <p><strong>Cancelamento:</strong> {contract.cancellationTerms}</p>
          <p><strong>Direitos:</strong> {contract.rightsAndOwnership}</p>
          <p><strong>Suporte:</strong> {contract.supportTerms}</p>
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Aceite digital simples" />
          {contract.status === "ACEITO" ? (
            <p className="text-sm leading-7 text-emerald-100">Contrato aceito em <DateDisplay value={contract.acceptedAt} />.</p>
          ) : (
            <div className="grid gap-4">
              <form action={acceptPublicContractAction}>
                <input type="hidden" name="token" value={token} />
                <SubmitButton>Aceitar contrato</SubmitButton>
              </form>
              <form action={rejectPublicContractAction} className="grid gap-3">
                <input type="hidden" name="token" value={token} />
                <Field label="Motivo da recusa">
                  <Textarea name="reason" />
                </Field>
                <SubmitButton variant="danger">Recusar contrato</SubmitButton>
              </form>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="Enviar comentário" />
          <CommentForm action={createPublicCommentAction} entityType="CONTRACT" publicToken={token} />
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
