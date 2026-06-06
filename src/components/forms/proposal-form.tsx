import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { dateInputValue, type ClientOption } from "@/components/forms/helpers";
import { linesToText } from "@/lib/utils";

type ProposalInitial = {
  id?: string;
  clientId?: string;
  briefingId?: string | null;
  title?: string;
  summary?: string;
  includedScope?: string[];
  excludedScope?: string[];
  deliverables?: string[];
  milestones?: string[];
  timeline?: string;
  totalPrice?: unknown;
  paymentTerms?: string;
  validUntil?: Date | string | null;
  notes?: string | null;
  status?: string;
};

export function ProposalForm({
  action,
  clients,
  briefings = [],
  initial,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: ClientOption[];
  briefings?: { id: string; title: string }[];
  initial?: ProposalInitial;
}) {
  return (
    <form action={action} className="grid gap-5">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Cliente">
          <Select name="clientId" defaultValue={initial?.clientId ?? clients[0]?.id} required>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company || client.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Briefing relacionado">
          <Select name="briefingId" defaultValue={initial?.briefingId ?? ""}>
            <option value="">Sem briefing</option>
            {briefings.map((briefing) => (
              <option key={briefing.id} value={briefing.id}>
                {briefing.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Titulo">
          <Input name="title" defaultValue={initial?.title ?? ""} required />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={initial?.status ?? "RASCUNHO"}>
            <option value="RASCUNHO">Rascunho</option>
            <option value="ENVIADA">Enviada</option>
            <option value="VISUALIZADA">Visualizada</option>
            <option value="APROVADA">Aprovada</option>
            <option value="RECUSADA">Recusada</option>
            <option value="EXPIRADA">Expirada</option>
          </Select>
        </Field>
      </div>
      <Field label="Resumo">
        <Textarea name="summary" defaultValue={initial?.summary ?? ""} required />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Escopo incluso">
          <Textarea name="includedScope" defaultValue={linesToText(initial?.includedScope)} />
        </Field>
        <Field label="Fora do escopo">
          <Textarea name="excludedScope" defaultValue={linesToText(initial?.excludedScope)} />
        </Field>
        <Field label="Entregaveis">
          <Textarea name="deliverables" defaultValue={linesToText(initial?.deliverables)} />
        </Field>
        <Field label="Etapas">
          <Textarea name="milestones" defaultValue={linesToText(initial?.milestones)} />
        </Field>
        <Field label="Prazo">
          <Input name="timeline" defaultValue={initial?.timeline ?? ""} required />
        </Field>
        <Field label="Valor total">
          <Input name="totalPrice" type="number" step="0.01" defaultValue={String(initial?.totalPrice ?? 0)} required />
        </Field>
        <Field label="Validade">
          <Input name="validUntil" type="date" defaultValue={dateInputValue(initial?.validUntil)} />
        </Field>
        <Field label="Forma de pagamento">
          <Input name="paymentTerms" defaultValue={initial?.paymentTerms ?? ""} required />
        </Field>
      </div>
      <Field label="Observacoes">
        <Textarea name="notes" defaultValue={initial?.notes ?? ""} />
      </Field>
      <div>
        <SubmitButton>{initial?.id ? "Salvar proposta" : "Criar proposta"}</SubmitButton>
      </div>
    </form>
  );
}
