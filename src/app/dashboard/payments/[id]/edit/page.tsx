import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { PaymentForm } from "@/components/forms/payment-form";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { deletePaymentAction, updatePaymentAction } from "@/server/actions/payments";

export default async function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const prisma = getPrisma();
  const [payment, clients, projects] = await Promise.all([
    prisma.payment.findFirst({ where: { id, userId: user.id } }),
    prisma.client.findMany({ where: { userId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
    prisma.project.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true } }),
  ]);
  if (!payment) notFound();

  return (
    <>
      <PageHeader title="Editar pagamento" description={payment.description} />
      <Card>
        <PaymentForm action={updatePaymentAction} clients={clients} projects={projects} initial={payment} />
        <form action={deletePaymentAction} className="mt-5">
          <input type="hidden" name="id" value={payment.id} />
          <ConfirmSubmitButton message="Excluir pagamento?">Excluir pagamento</ConfirmSubmitButton>
        </form>
      </Card>
    </>
  );
}
