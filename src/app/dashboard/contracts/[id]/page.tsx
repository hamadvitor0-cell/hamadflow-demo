import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { publicAppUrl } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { contractStatusLabels } from "@/lib/status";
import { deleteContractAction } from "@/server/actions/contracts";
import { CommentForm } from "@/components/forms/comment-form";
import { createDashboardCommentAction } from "@/server/actions/comments";

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </section>
  );
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const contract = await getPrisma().contract.findFirst({
    where: { id, userId: user.id },
    include: { client: true, proposal: true, projects: true },
  });
  if (!contract) notFound();

  const comments = await getPrisma().comment.findMany({
    where: { entityType: "CONTRACT", entityId: contract.id },
    orderBy: { createdAt: "desc" },
  });
  const publicUrl = `${publicAppUrl()}/client/contract/${contract.publicToken}`;

  return (
    <>
      <PageHeader
        title={contract.title}
        description={contract.client.company || contract.client.name}
        actions={
          <>
            <ButtonLink href={`/dashboard/contracts/${contract.id}/preview`} variant="secondary"><ExternalLink className="h-4 w-4" /> Preview</ButtonLink>
            <ButtonLink href={`/api/contracts/${contract.id}/pdf`} variant="secondary"><Download className="h-4 w-4" /> Baixar PDF</ButtonLink>
            <ButtonLink href={`/dashboard/contracts/${contract.id}/edit`} variant="secondary"><Pencil className="h-4 w-4" /> Editar</ButtonLink>
            <form action={deleteContractAction}>
              <input type="hidden" name="id" value={contract.id} />
              <ConfirmSubmitButton message="Excluir contrato?"><Trash2 className="h-4 w-4" /> Excluir</ConfirmSubmitButton>
            </form>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.38fr]">
        <Card>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={contract.status} label={contractStatusLabels[contract.status]} />
            <span className="ml-auto text-2xl font-semibold"><MoneyDisplay value={contract.totalPrice} /></span>
          </div>
          <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            {contract.legalDisclaimer}
          </div>
          <div className="mt-6 grid gap-5 text-sm leading-7 text-slate-300">
            <p><strong className="text-foreground">Partes:</strong> {contract.contractorData} / {contract.clientData}</p>
            <p><strong className="text-foreground">Objeto:</strong> {contract.object}</p>
            <p><strong className="text-foreground">Escopo:</strong> {contract.scope}</p>
            <p><strong className="text-foreground">Pagamento:</strong> {contract.paymentTerms}</p>
            <p><strong className="text-foreground">Prazo:</strong> {contract.deadline}</p>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <List title="Responsabilidades do freelancer" items={contract.freelancerResponsibilities} />
            <List title="Responsabilidades do cliente" items={contract.clientResponsibilities} />
            <List title="Cláusulas adicionais" items={contract.additionalClauses} />
          </div>
        </Card>
        <div className="grid gap-5">
          <Card>
            <CardHeader title="Aceite" />
            <div className="grid gap-2 text-sm text-slate-300">
              <p>Data: <DateDisplay value={contract.acceptedAt} /></p>
              <p>IP: {contract.acceptedIp || "-"}</p>
              <p>User-agent: {contract.acceptedUserAgent || "-"}</p>
              {contract.rejectionReason ? <p>Recusa: {contract.rejectionReason}</p> : null}
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
        <CommentForm action={createDashboardCommentAction} entityType="CONTRACT" entityId={contract.id} clientId={contract.clientId} returnTo={`/dashboard/contracts/${contract.id}`} />
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
