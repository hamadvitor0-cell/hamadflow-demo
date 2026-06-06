import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmSubmitButton, SubmitButton } from "@/components/ui/submit-button";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import {
  deleteBriefingAction,
  generateProposalFromBriefingAction,
} from "@/server/actions/briefings";

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm text-slate-300">
        {items.length ? items.map((item) => <li key={item}>- {item}</li>) : <li className="text-muted">Sem itens.</li>}
      </ul>
    </Card>
  );
}

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const briefing = await getPrisma().briefing.findFirst({
    where: { id, userId: user.id },
    include: { client: true, proposals: true },
  });
  if (!briefing) notFound();

  return (
    <>
      <PageHeader
        title={briefing.title}
        description={`${briefing.client.company || briefing.client.name} - ${briefing.projectType}`}
        actions={
          <>
            <ButtonLink href={`/dashboard/briefings/${briefing.id}/edit`} variant="secondary">
              <Pencil className="h-4 w-4" /> Editar
            </ButtonLink>
            <form action={generateProposalFromBriefingAction}>
              <input type="hidden" name="id" value={briefing.id} />
              <SubmitButton>
                <FileText className="h-4 w-4" /> Gerar proposta
              </SubmitButton>
            </form>
            <form action={deleteBriefingAction}>
              <input type="hidden" name="id" value={briefing.id} />
              <ConfirmSubmitButton message="Excluir briefing?">
                <Trash2 className="h-4 w-4" /> Excluir
              </ConfirmSubmitButton>
            </form>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <Card>
          <CardHeader title="Resumo organizado" />
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p><strong className="text-foreground">Objetivo:</strong> {briefing.objective}</p>
            <p><strong className="text-foreground">Publico-alvo:</strong> {briefing.targetAudience || "-"}</p>
            <p><strong className="text-foreground">Prazo sugerido:</strong> {briefing.suggestedTimeline || "-"}</p>
            <p>
              <strong className="text-foreground">Faixa:</strong>{" "}
              <MoneyDisplay value={briefing.suggestedPriceMin} /> - <MoneyDisplay value={briefing.suggestedPriceMax} />
            </p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Propostas geradas" />
          <div className="grid gap-2 text-sm">
            {briefing.proposals.map((proposal) => (
              <Link key={proposal.id} href={`/dashboard/proposals/${proposal.id}`} className="rounded-md border border-border p-3 text-primary">
                {proposal.title}
              </Link>
            ))}
            {!briefing.proposals.length ? <p className="text-muted">Nenhuma proposta ainda.</p> : null}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ListBlock title="Paginas necessárias" items={briefing.pages} />
        <ListBlock title="Funcionalidades" items={briefing.features} />
        <ListBlock title="Opcionais" items={briefing.optionalFeatures} />
        <ListBlock title="Informações faltantes" items={briefing.missingInfo} />
        <ListBlock title="Riscos" items={briefing.risks} />
        <ListBlock title="Perguntas para o cliente" items={briefing.nextQuestions} />
      </div>
    </>
  );
}
