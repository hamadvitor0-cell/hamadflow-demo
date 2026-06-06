import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { ContractForm } from "@/components/forms/contract-form";
import { updateContractAction } from "@/server/actions/contracts";

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const prisma = getPrisma();
  const [contract, clients, proposals] = await Promise.all([
    prisma.contract.findFirst({ where: { id, userId: user.id } }),
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
    prisma.proposal.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!contract) notFound();

  return (
    <>
      <PageHeader title="Editar contrato" description={contract.title} />
      <Card>
        <ContractForm action={updateContractAction} clients={clients} proposals={proposals} initial={contract} />
      </Card>
    </>
  );
}
