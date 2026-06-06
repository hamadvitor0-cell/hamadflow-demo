import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/forms/settings-form";
import { updateSettingsAction } from "@/server/actions/settings";
import { isDemoMode } from "@/lib/demo";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dados usados em propostas, contratos e rodapés comerciais."
      />
      <Card>
        <SettingsForm action={updateSettingsAction} initial={user} demoMode={isDemoMode()} />
      </Card>
    </>
  );
}
