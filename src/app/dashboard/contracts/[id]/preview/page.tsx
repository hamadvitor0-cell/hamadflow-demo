import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/dashboard/money-display";

export default async function ContractPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const contract = await getPrisma().contract.findFirst({
    where: { id, userId: user.id },
    include: { client: true, user: true },
  });
  if (!contract) notFound();

  return (
    <>
      <PageHeader title="Preview do contrato" description="Documento de aceite simples." />
      <Card className="mx-auto max-w-4xl bg-slate-50 p-8 text-slate-950">
        <p className="text-sm font-semibold text-teal-700">{contract.user.brandName}</p>
        <h1 className="mt-3 text-3xl font-semibold">{contract.title}</h1>
        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          {contract.legalDisclaimer}
        </div>
        <div className="mt-8 grid gap-5 text-sm leading-8 text-slate-700">
          <p><strong>Contratado:</strong> {contract.contractorData}</p>
          <p><strong>Contratante:</strong> {contract.clientData}</p>
          <p><strong>Objeto:</strong> {contract.object}</p>
          <p><strong>Escopo:</strong> {contract.scope}</p>
          <p><strong>Valor:</strong> <MoneyDisplay value={contract.totalPrice} /></p>
          <p><strong>Pagamento:</strong> {contract.paymentTerms}</p>
          <p><strong>Prazo:</strong> {contract.deadline}</p>
          <p><strong>Cancelamento:</strong> {contract.cancellationTerms}</p>
          <p><strong>Direitos:</strong> {contract.rightsAndOwnership}</p>
          <p><strong>Suporte:</strong> {contract.supportTerms}</p>
        </div>
      </Card>
    </>
  );
}
