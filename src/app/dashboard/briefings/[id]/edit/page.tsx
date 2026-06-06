import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { BriefingForm } from "@/components/forms/briefing-form";
import { updateBriefingAction } from "@/server/actions/briefings";

export default async function EditBriefingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const prisma = getPrisma();
  const [briefing, clients] = await Promise.all([
    prisma.briefing.findFirst({ where: { id, userId: user.id } }),
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
  ]);
  if (!briefing) notFound();

  return (
    <>
      <PageHeader title="Editar briefing" description={briefing.title} />
      <Card>
        <BriefingForm action={updateBriefingAction} clients={clients} initial={briefing} />
      </Card>
    </>
  );
}
