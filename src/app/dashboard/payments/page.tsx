import Link from "next/link";
import { CreditCard, Plus, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { MoneyDisplay } from "@/components/dashboard/money-display";
import { DateDisplay } from "@/components/dashboard/date-display";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { paymentStatusLabels } from "@/lib/status";
import { generateCollectionMessageAction } from "@/server/actions/payments";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ messageId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const prisma = getPrisma();
  const [payments, messageLog, received, pending, overdue] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: user.id },
      include: { client: true, project: true },
      orderBy: { dueDate: "asc" },
    }),
    params.messageId
      ? prisma.aiGenerationLog.findFirst({
          where: { id: params.messageId, userId: user.id, type: "CLIENT_MESSAGE" },
        })
      : null,
    prisma.payment.aggregate({ where: { userId: user.id, status: "PAGO" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { userId: user.id, status: "PENDENTE" }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { userId: user.id, status: "ATRASADO" }, _sum: { amount: true } }),
  ]);
  const message = messageLog?.output && typeof messageLog.output === "object" && "message" in messageLog.output
    ? String(messageLog.output.message)
    : null;

  return (
    <>
      <PageHeader
        title="Pagamentos"
        description="Controle receita recebida, pendente, atrasada e gere mensagens de cobrança."
        actions={<ButtonLink href="/dashboard/payments/new"><Plus className="h-4 w-4" /> Novo pagamento</ButtonLink>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-muted">Receita recebida</p><p className="mt-2 text-2xl font-semibold"><MoneyDisplay value={received._sum.amount} /></p></Card>
        <Card><p className="text-sm text-muted">Receita pendente</p><p className="mt-2 text-2xl font-semibold"><MoneyDisplay value={pending._sum.amount} /></p></Card>
        <Card><p className="text-sm text-muted">Receita atrasada</p><p className="mt-2 text-2xl font-semibold"><MoneyDisplay value={overdue._sum.amount} /></p></Card>
      </div>

      {message ? (
        <Card className="mb-5 border-primary/30 bg-primary/10">
          <CardHeader title="Mensagem gerada com IA" description={`Modo: ${messageLog?.status === "MOCK" ? "demo mock" : "OpenAI"}`} />
          <p className="text-sm leading-7 text-slate-100">{message}</p>
        </Card>
      ) : null}

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhum pagamento cadastrado"
          description="Cadastre cobranças por cliente e projeto para acompanhar receita."
          href="/dashboard/payments/new"
          actionLabel="Criar pagamento"
        />
      ) : (
        <Card>
          <DataTable headers={["Pagamento", "Cliente", "Projeto", "Status", "Vencimento", "Valor", "Cobrança IA"]}>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/payments/${payment.id}/edit`} className="font-medium text-primary">
                    {payment.description}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{payment.client.company || payment.client.name}</td>
                <td className="px-4 py-3 text-slate-300">{payment.project?.name || "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={payment.status} label={paymentStatusLabels[payment.status]} /></td>
                <td className="px-4 py-3"><DateDisplay value={payment.dueDate} /></td>
                <td className="px-4 py-3"><MoneyDisplay value={payment.amount} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {(["educada", "direta", "firme"] as const).map((type) => (
                      <form key={type} action={generateCollectionMessageAction}>
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <input type="hidden" name="type" value={type} />
                        <SubmitButton variant="secondary" pendingLabel="Gerando...">
                          <Sparkles className="h-3.5 w-3.5" /> {type}
                        </SubmitButton>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      )}
    </>
  );
}
