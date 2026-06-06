import { Field, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submit-button";

export function CommentForm({
  action,
  entityType,
  entityId,
  clientId,
  returnTo,
  publicToken,
}: {
  action: (formData: FormData) => Promise<void>;
  entityType: "PROPOSAL" | "CONTRACT" | "PROJECT";
  entityId?: string;
  clientId?: string | null;
  returnTo?: string;
  publicToken?: string;
}) {
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="entityType" value={entityType} />
      {entityId ? <input type="hidden" name="entityId" value={entityId} /> : null}
      {clientId ? <input type="hidden" name="clientId" value={clientId} /> : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {publicToken ? <input type="hidden" name="token" value={publicToken} /> : null}
      {publicToken ? (
        <Field label="Seu nome">
          <Input name="authorName" placeholder="Nome" required />
        </Field>
      ) : null}
      <Field label="Comentario">
        <Textarea name="content" required />
      </Field>
      <SubmitButton pendingLabel="Enviando...">Enviar comentario</SubmitButton>
    </form>
  );
}
