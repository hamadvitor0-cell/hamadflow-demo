import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";

type ClientInitial = {
  id?: string;
  name?: string;
  company?: string | null;
  email?: string;
  phone?: string | null;
  document?: string | null;
  type?: string;
  source?: string;
  status?: string;
  notes?: string | null;
};

export function ClientForm({
  action,
  initial,
  demoMode = false,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: ClientInitial;
  demoMode?: boolean;
}) {
  return (
    <form action={action} className="grid gap-5">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nome">
          <Input name="name" defaultValue={initial?.name ?? ""} required />
        </Field>
        <Field label="Empresa">
          <Input name="company" defaultValue={initial?.company ?? ""} />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" defaultValue={initial?.email ?? ""} required />
        </Field>
        <Field label="WhatsApp">
          <Input name="phone" defaultValue={initial?.phone ?? ""} placeholder="+55..." />
        </Field>
        <Field label={demoMode ? "CPF/CNPJ (desativado na demo)" : "CPF/CNPJ"}>
          <Input
            name="document"
            defaultValue={demoMode ? "" : initial?.document ?? ""}
            disabled={demoMode}
          />
        </Field>
        <Field label="Tipo">
          <Select name="type" defaultValue={initial?.type ?? "EMPRESA"}>
            <option value="PESSOA_FISICA">Pessoa fisica</option>
            <option value="EMPRESA">Empresa</option>
            <option value="AGENCIA">Agencia</option>
            <option value="OUTRO">Outro</option>
          </Select>
        </Field>
        <Field label="Origem">
          <Select name="source" defaultValue={initial?.source ?? "INDICACAO"}>
            <option value="INDICACAO">Indicacao</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="SITE">Site</option>
            <option value="OUTRO">Outro</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={initial?.status ?? "LEAD"}>
            <option value="LEAD">Lead</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </Select>
        </Field>
      </div>
      <Field label="Observacoes">
        <Textarea name="notes" defaultValue={initial?.notes ?? ""} />
      </Field>
      <div>
        <SubmitButton>{initial?.id ? "Salvar cliente" : "Criar cliente"}</SubmitButton>
      </div>
    </form>
  );
}
