import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ClientOption, ProposalOption } from "@/components/forms/helpers";
import { linesToText } from "@/lib/utils";

type ContractInitial = {
  id?: string;
  clientId?: string;
  proposalId?: string | null;
  title?: string;
  contractorData?: string;
  clientData?: string;
  object?: string;
  scope?: string;
  totalPrice?: unknown;
  paymentTerms?: string;
  deadline?: string;
  includedRevisions?: number;
  freelancerResponsibilities?: string[];
  clientResponsibilities?: string[];
  cancellationTerms?: string;
  penaltyTerms?: string | null;
  rightsAndOwnership?: string;
  supportTerms?: string;
  additionalClauses?: string[];
  status?: string;
};

export function ContractForm({
  action,
  clients,
  proposals = [],
  initial,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: ClientOption[];
  proposals?: ProposalOption[];
  initial?: ContractInitial;
}) {
  return (
    <form action={action} className="grid gap-5">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
        Este contrato é um modelo gerado automaticamente para fins de organização comercial e não substitui orientação jurídica profissional.
      </div>
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
        <Field label="Titulo">
          <Input name="title" defaultValue={initial?.title ?? ""} required />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={initial?.status ?? "RASCUNHO"}>
            <option value="RASCUNHO">Rascunho</option>
            <option value="ENVIADO">Enviado</option>
            <option value="AGUARDANDO_ACEITE">Aguardando aceite</option>
            <option value="ACEITO">Aceito</option>
            <option value="RECUSADO">Recusado</option>
            <option value="CANCELADO">Cancelado</option>
          </Select>
        </Field>
        <Field label="Dados do contratado">
          <Textarea name="contractorData" defaultValue={initial?.contractorData ?? ""} required />
        </Field>
        <Field label="Dados do contratante">
          <Textarea name="clientData" defaultValue={initial?.clientData ?? ""} required />
        </Field>
        <Field label="Objeto">
          <Textarea name="object" defaultValue={initial?.object ?? ""} required />
        </Field>
        <Field label="Escopo">
          <Textarea name="scope" defaultValue={initial?.scope ?? ""} required />
        </Field>
        <Field label="Valor">
          <Input name="totalPrice" type="number" step="0.01" defaultValue={String(initial?.totalPrice ?? 0)} required />
        </Field>
        <Field label="Prazo">
          <Input name="deadline" defaultValue={initial?.deadline ?? ""} required />
        </Field>
        <Field label="Forma de pagamento">
          <Input name="paymentTerms" defaultValue={initial?.paymentTerms ?? ""} required />
        </Field>
        <Field label="Revisoes inclusas">
          <Input name="includedRevisions" type="number" defaultValue={initial?.includedRevisions ?? 2} />
        </Field>
        <Field label="Responsabilidades do freelancer">
          <Textarea name="freelancerResponsibilities" defaultValue={linesToText(initial?.freelancerResponsibilities)} />
        </Field>
        <Field label="Responsabilidades do cliente">
          <Textarea name="clientResponsibilities" defaultValue={linesToText(initial?.clientResponsibilities)} />
        </Field>
        <Field label="Cancelamento">
          <Textarea name="cancellationTerms" defaultValue={initial?.cancellationTerms ?? ""} required />
        </Field>
        <Field label="Multa opcional">
          <Textarea name="penaltyTerms" defaultValue={initial?.penaltyTerms ?? ""} />
        </Field>
        <Field label="Direitos de uso/entrega">
          <Textarea name="rightsAndOwnership" defaultValue={initial?.rightsAndOwnership ?? ""} required />
        </Field>
        <Field label="Suporte pos-entrega">
          <Textarea name="supportTerms" defaultValue={initial?.supportTerms ?? ""} required />
        </Field>
      </div>
      <Field label="Clausulas adicionais">
        <Textarea name="additionalClauses" defaultValue={linesToText(initial?.additionalClauses)} />
      </Field>
      <div>
        <SubmitButton>{initial?.id ? "Salvar contrato" : "Criar contrato"}</SubmitButton>
      </div>
    </form>
  );
}
