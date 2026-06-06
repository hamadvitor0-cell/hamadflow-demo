import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { ProposalForm } from "@/components/forms/proposal-form";
import { updateProposalAction } from "@/server/actions/proposals";

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const prisma = getPrisma();
  const [proposal, clients, briefings] = await Promise.all([
    prisma.proposal.findFirst({ where: { id, userId: user.id } }),
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
  if (!proposal) notFound();

  return (
    <>
      <PageHeader title="Editar proposta" description={proposal.title} />
      <Card>
        <ProposalForm action={updateProposalAction} clients={clients} briefings={briefings} initial={proposal} />
      </Card>
    </>
  );
}
