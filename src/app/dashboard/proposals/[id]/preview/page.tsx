import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/dashboard/money-display";

export default async function ProposalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const proposal = await getPrisma().proposal.findFirst({
    where: { id, userId: user.id },
    include: { client: true, user: true },
  });
  if (!proposal) notFound();

  return (
    <>
      <PageHeader title="Preview da proposta" description="Documento comercial como o cliente verá." />
      <Card className="mx-auto max-w-4xl bg-slate-50 p-8 text-slate-950">
        <div className="flex justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-semibold text-teal-700">{proposal.user.brandName}</p>
            <h1 className="mt-3 text-3xl font-semibold">{proposal.title}</h1>
          </div>
          <div className="text-right text-sm">
            <p>{proposal.client.company || proposal.client.name}</p>
            <p className="text-slate-500">{proposal.client.email}</p>
          </div>
        </div>
        <p className="mt-6 leading-8 text-slate-700">{proposal.summary}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            ["Escopo incluso", proposal.includedScope],
            ["Fora do escopo", proposal.excludedScope],
            ["Entregáveis", proposal.deliverables],
            ["Etapas", proposal.milestones],
          ].map(([title, items]) => (
            <section key={title as string}>
              <h2 className="font-semibold">{title as string}</h2>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                {(items as string[]).map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-8 rounded-lg bg-slate-950 p-5 text-white">
          <p className="text-sm text-slate-300">Investimento</p>
          <p className="mt-2 text-3xl font-semibold"><MoneyDisplay value={proposal.totalPrice} /></p>
          <p className="mt-3 text-sm text-slate-300">{proposal.paymentTerms}</p>
        </div>
      </Card>
    </>
  );
}
