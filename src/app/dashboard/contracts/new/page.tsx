import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { ContractForm } from "@/components/forms/contract-form";
import { createContractAction } from "@/server/actions/contracts";

export default async function NewContractPage() {
  const user = await requireUser();
  const prisma = getPrisma();
  const [clients, proposals] = await Promise.all([
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

  return (
    <>
      <PageHeader title="Novo contrato" description="Crie um contrato claro para o projeto." />
      <Card>
        <ContractForm
          action={createContractAction}
          clients={clients}
          proposals={proposals}
          initial={{
            title: "Contrato de prestação de serviços digitais",
            contractorData: user.brandName,
            paymentTerms: "50% para iniciar e 50% na entrega.",
            deadline: "Conforme cronograma aprovado.",
            includedRevisions: 2,
            totalPrice: 0,
          }}
        />
      </Card>
    </>
  );
}
