import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTaskAction } from "@/server/actions/projects";

export function TaskForm({ projectId }: { projectId: string }) {
  return (
    <form action={createTaskAction} className="grid gap-3">
      <input type="hidden" name="projectId" value={projectId} />
      <Field label="Titulo">
        <Input name="title" required />
      </Field>
      <Field label="Descricao">
        <Textarea name="description" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Status">
          <Select name="status" defaultValue="PENDENTE">
            <option value="PENDENTE">Pendente</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDA">Concluida</option>
          </Select>
        </Field>
        <Field label="Prioridade">
          <Select name="priority" defaultValue="MEDIA">
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </Select>
        </Field>
        <Field label="Prazo">
          <Input name="dueDate" type="date" />
        </Field>
      </div>
      <SubmitButton>Criar tarefa</SubmitButton>
    </form>
  );
}
