import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { linesToText } from "@/lib/utils";
import type { ClientOption } from "@/components/forms/helpers";

type BriefingInitial = {
  id?: string;
  clientId?: string;
  title?: string;
  rawInput?: string | null;
  projectType?: string;
  objective?: string;
  targetAudience?: string | null;
  pages?: string[];
  features?: string[];
  optionalFeatures?: string[];
  missingInfo?: string[];
  risks?: string[];
  suggestedTimeline?: string | null;
  complexity?: string;
  suggestedPriceMin?: unknown;
  suggestedPriceMax?: unknown;
  nextQuestions?: string[];
};

export function BriefingForm({
  action,
  clients,
  initial,
}: {
  action: (formData: FormData) => Promise<void>;
  clients: ClientOption[];
  initial?: BriefingInitial;
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
        <Field label="Titulo">
          <Input name="title" defaultValue={initial?.title ?? ""} required />
        </Field>
      </div>
      <Field
        label="Cole aqui a conversa com o cliente"
        hint="Use o botao Organizar com IA para preencher o briefing automaticamente. Sem chave OpenAI, entra o modo demo."
      >
        <Textarea
          name="rawInput"
          defaultValue={initial?.rawInput ?? ""}
          className="min-h-36"
          placeholder="Cliente quer um site para loja de roupas..."
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Tipo de projeto">
          <Input name="projectType" defaultValue={initial?.projectType ?? "Site institucional"} required />
        </Field>
        <Field label="Prazo sugerido">
          <Input name="suggestedTimeline" defaultValue={initial?.suggestedTimeline ?? ""} />
        </Field>
        <Field label="Objetivo">
          <Textarea name="objective" defaultValue={initial?.objective ?? ""} />
        </Field>
        <Field label="Publico-alvo">
          <Textarea name="targetAudience" defaultValue={initial?.targetAudience ?? ""} />
        </Field>
        <Field label="Paginas">
          <Textarea name="pages" defaultValue={linesToText(initial?.pages)} />
        </Field>
        <Field label="Funcionalidades">
          <Textarea name="features" defaultValue={linesToText(initial?.features)} />
        </Field>
        <Field label="Funcionalidades opcionais">
          <Textarea name="optionalFeatures" defaultValue={linesToText(initial?.optionalFeatures)} />
        </Field>
        <Field label="Informacoes faltantes">
          <Textarea name="missingInfo" defaultValue={linesToText(initial?.missingInfo)} />
        </Field>
        <Field label="Riscos">
          <Textarea name="risks" defaultValue={linesToText(initial?.risks)} />
        </Field>
        <Field label="Proximas perguntas">
          <Textarea name="nextQuestions" defaultValue={linesToText(initial?.nextQuestions)} />
        </Field>
        <Field label="Complexidade">
          <Select name="complexity" defaultValue={initial?.complexity ?? "MEDIA"}>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preco min.">
            <Input name="suggestedPriceMin" type="number" step="0.01" defaultValue={String(initial?.suggestedPriceMin ?? 0)} />
          </Field>
          <Field label="Preco max.">
            <Input name="suggestedPriceMax" type="number" step="0.01" defaultValue={String(initial?.suggestedPriceMax ?? 0)} />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="mode" value="ai">
          Organizar com IA
        </Button>
        <Button type="submit" name="mode" value="manual" variant="secondary">
          Salvar manualmente
        </Button>
      </div>
    </form>
  );
}
