import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { dateInputValue, type ClientOption, type ProjectOption } from "@/components/forms/helpers";

type PaymentInitial = {
  id?: string;
  clientId?: string;
  projectId?: string | null;
  description?: string;
  amount?: unknown;
  dueDate?: Date | string | null;
  paidAt?: Date | string | null;
  status?: string;
  method?: string;
  notes?: string | null;
};

export function PaymentForm({
  action,
  clients,
  projects = [],
  initial,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: ClientOption[];
  projects?: ProjectOption[];
  initial?: PaymentInitial;
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
        <Field label="Projeto">
          <Select name="projectId" defaultValue={initial?.projectId ?? ""}>
            <option value="">Sem projeto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Descricao">
          <Input name="description" defaultValue={initial?.description ?? ""} required />
        </Field>
        <Field label="Valor">
          <Input name="amount" type="number" step="0.01" defaultValue={String(initial?.amount ?? 0)} required />
        </Field>
        <Field label="Vencimento">
          <Input name="dueDate" type="date" defaultValue={dateInputValue(initial?.dueDate)} required />
        </Field>
        <Field label="Data de pagamento">
          <Input name="paidAt" type="date" defaultValue={dateInputValue(initial?.paidAt)} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={initial?.status ?? "PENDENTE"}>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="ATRASADO">Atrasado</option>
            <option value="CANCELADO">Cancelado</option>
          </Select>
        </Field>
        <Field label="Metodo">
          <Select name="method" defaultValue={initial?.method ?? "PIX"}>
            <option value="PIX">Pix</option>
            <option value="BOLETO">Boleto</option>
            <option value="CARTAO">Cartao</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="OUTRO">Outro</option>
          </Select>
        </Field>
      </div>
      <Field label="Observacoes">
        <Textarea name="notes" defaultValue={initial?.notes ?? ""} />
      </Field>
      <div>
        <SubmitButton>{initial?.id ? "Salvar pagamento" : "Criar pagamento"}</SubmitButton>
      </div>
    </form>
  );
}
