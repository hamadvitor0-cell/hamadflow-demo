import { ClientForm } from "@/components/forms/client-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { createClientAction } from "@/server/actions/clients";
import { isDemoMode } from "@/lib/demo";

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="Novo cliente"
        description="Cadastre dados comerciais e observações para iniciar o fluxo."
      />
      <Card>
        <ClientForm action={createClientAction} demoMode={isDemoMode()} />
      </Card>
    </>
  );
}
