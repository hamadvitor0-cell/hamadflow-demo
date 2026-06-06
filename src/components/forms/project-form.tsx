import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  dateInputValue,
  type ClientOption,
  type ContractOption,
  type ProposalOption,
} from "@/components/forms/helpers";
import { linesToText } from "@/lib/utils";

type ProjectInitial = {
  id?: string;
  clientId?: string;
  proposalId?: string | null;
  contractId?: string | null;
  name?: string;
  description?: string;
  status?: string;
  startDate?: Date | string | null;
  dueDate?: Date | string | null;
  value?: unknown;
  notes?: string | null;
  links?: string[];
};

export function ProjectForm({
  action,
  clients,
  proposals = [],
  contracts = [],
  initial,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: ClientOption[];
  proposals?: ProposalOption[];
  contracts?: ContractOption[];
  initial?: ProjectInitial;
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
        <Field label="Status">
          <Select name="status" defaultValue={initial?.status ?? "ORCAMENTO"}>
            <option value="ORCAMENTO">Orcamento</option>
            <option value="APROVADO">Aprovado</option>
            <option value="AGUARDANDO_CONTRATO">Aguardando contrato</option>
            <option value="EM_DESENVOLVIMENTO">Em desenvolvimento</option>
            <option value="AGUARDANDO_REVISAO">Aguardando revisao</option>
            <option value="AJUSTES">Ajustes</option>
            <option value="ENTREGUE">Entregue</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
          </Select>
        </Field>
        <Field label="Proposta relacionada">
          <Select name="proposalId" defaultValue={initial?.proposalId ?? ""}>
            <option value="">Sem proposta</option>
            {proposals.map((proposal) => (
              <option key={proposal.id} value={proposal.id}>
                {proposal.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Contrato relacionado">
          <Select name="contractId" defaultValue={initial?.contractId ?? ""}>
            <option value="">Sem contrato</option>
            {contracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nome do projeto">
          <Input name="name" defaultValue={initial?.name ?? ""} required />
        </Field>
        <Field label="Valor">
          <Input name="value" type="number" step="0.01" defaultValue={String(initial?.value ?? 0)} required />
        </Field>
        <Field label="Data de inicio">
          <Input name="startDate" type="date" defaultValue={dateInputValue(initial?.startDate)} />
        </Field>
        <Field label="Entrega prevista">
          <Input name="dueDate" type="date" defaultValue={dateInputValue(initial?.dueDate)} />
        </Field>
      </div>
      <Field label="Descricao">
        <Textarea name="description" defaultValue={initial?.description ?? ""} required />
      </Field>
      <Field label="Links ou arquivos">
        <Textarea name="links" defaultValue={linesToText(initial?.links)} />
      </Field>
      <Field label="Observacoes">
        <Textarea name="notes" defaultValue={initial?.notes ?? ""} />
      </Field>
      <div>
        <SubmitButton>{initial?.id ? "Salvar projeto" : "Criar projeto"}</SubmitButton>
      </div>
    </form>
  );
}
