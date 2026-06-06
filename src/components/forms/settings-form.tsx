import { Field, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";

type SettingsInitial = {
  name: string;
  brandName: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  document?: string | null;
  logoUrl?: string | null;
  footerText?: string | null;
  pixKey?: string | null;
  currency?: string | null;
};

export function SettingsForm({
  action,
  initial,
  demoMode = false,
}: {
  action: (formData: FormData) => Promise<void>;
  initial: SettingsInitial;
  demoMode?: boolean;
}) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nome">
          <Input name="name" defaultValue={initial.name} required />
        </Field>
        <Field label="Nome da marca/empresa">
          <Input name="brandName" defaultValue={initial.brandName} required />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" defaultValue={initial.email} required readOnly={demoMode} />
        </Field>
        <Field label="WhatsApp">
          <Input name="phone" defaultValue={initial.phone ?? ""} />
        </Field>
        <Field label="Site">
          <Input name="website" defaultValue={initial.website ?? ""} />
        </Field>
        <Field label={demoMode ? "CPF/CNPJ (desativado na demo)" : "CPF/CNPJ"}>
          <Input name="document" defaultValue={demoMode ? "" : initial.document ?? ""} disabled={demoMode} />
        </Field>
        <Field label="Logo URL">
          <Input name="logoUrl" defaultValue={initial.logoUrl ?? ""} />
        </Field>
        <Field label={demoMode ? "Chave Pix (desativada na demo)" : "Chave Pix"}>
          <Input name="pixKey" defaultValue={demoMode ? "" : initial.pixKey ?? ""} disabled={demoMode} />
        </Field>
        <Field label="Moeda">
          <Input name="currency" defaultValue={initial.currency ?? "BRL"} />
        </Field>
      </div>
      <Field label="Texto padrao de rodape">
        <Textarea name="footerText" defaultValue={initial.footerText ?? ""} />
      </Field>
      <div>
        <SubmitButton>Salvar configuracoes</SubmitButton>
      </div>
    </form>
  );
}
