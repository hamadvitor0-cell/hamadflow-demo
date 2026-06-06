import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { BriefingForm } from "@/components/forms/briefing-form";
import { createBriefingAction } from "@/server/actions/briefings";

export default async function NewBriefingPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const clients = await getPrisma().client.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  });

  return (
    <>
      <PageHeader
        title="Novo briefing"
        description="Cole a conversa e gere um briefing estruturado, ou preencha manualmente."
      />
      <Card>
        <BriefingForm
          action={createBriefingAction}
          clients={clients}
          initial={{ clientId: params.clientId, title: "Novo briefing" }}
        />
      </Card>
    </>
  );
}
