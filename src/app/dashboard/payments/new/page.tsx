import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { PaymentForm } from "@/components/forms/payment-form";
import { createPaymentAction } from "@/server/actions/payments";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const prisma = getPrisma();
  const [clients, projects, selectedProject] = await Promise.all([
    prisma.client.findMany({ where: { userId: user.id }, orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
    prisma.project.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, select: { id: true, name: true } }),
    params.projectId ? prisma.project.findFirst({ where: { id: params.projectId, userId: user.id }, select: { id: true, clientId: true } }) : null,
  ]);

  return (
    <>
      <PageHeader title="Novo pagamento" description="Cadastre uma cobrança vinculada a cliente e projeto." />
      <Card>
        <PaymentForm
          action={createPaymentAction}
          clients={clients}
          projects={projects}
          initial={{ projectId: params.projectId, clientId: selectedProject?.clientId, status: "PENDENTE", method: "PIX", amount: 0 }}
        />
      </Card>
    </>
  );
}
