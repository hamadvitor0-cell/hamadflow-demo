import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { ProposalForm } from "@/components/forms/proposal-form";
import { createProposalAction } from "@/server/actions/proposals";

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const prisma = getPrisma();
  const [clients, briefings] = await Promise.all([
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
    prisma.briefing.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Nova proposta" description="Crie uma proposta manual editável e exportável." />
      <Card>
        <ProposalForm
          action={createProposalAction}
          clients={clients}
          briefings={briefings}
          initial={{
            clientId: params.clientId,
            title: "Desenvolvimento de projeto digital",
            timeline: "21 dias",
            paymentTerms: "50% para iniciar e 50% na entrega.",
            totalPrice: 0,
          }}
        />
      </Card>
    </>
  );
}
