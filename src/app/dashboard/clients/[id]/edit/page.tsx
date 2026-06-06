import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { ClientForm } from "@/components/forms/client-form";
import { updateClientAction } from "@/server/actions/clients";
import { isDemoMode } from "@/lib/demo";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const client = await getPrisma().client.findFirst({ where: { id, userId: user.id } });
  if (!client) notFound();

  return (
    <>
      <PageHeader title="Editar cliente" description={client.name} />
      <Card>
        <ClientForm action={updateClientAction} initial={client} demoMode={isDemoMode()} />
      </Card>
    </>
  );
}
