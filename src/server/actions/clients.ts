"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { formString } from "@/lib/utils";
import { clientSchema } from "@/lib/validations";
import { isDemoMode } from "@/lib/demo";

function clientPayload(formData: FormData) {
  return {
    id: formString(formData, "id"),
    name: formString(formData, "name"),
    company: formString(formData, "company"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    document: formString(formData, "document"),
    type: formString(formData, "type") || "EMPRESA",
    source: formString(formData, "source") || "INDICACAO",
    status: formString(formData, "status") || "LEAD",
    notes: formString(formData, "notes"),
  };
}

export async function createClientAction(formData: FormData) {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(clientPayload(formData));
  if (!parsed.success) redirect("/dashboard/clients/new?error=invalid");

  const client = await getPrisma().client.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      company: parsed.data.company || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      document: isDemoMode() ? null : parsed.data.document || null,
      type: parsed.data.type,
      source: parsed.data.source,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients/${client.id}?created=1`);
}

export async function updateClientAction(formData: FormData) {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(clientPayload(formData));
  if (!parsed.success || !parsed.data.id) redirect("/dashboard/clients?error=invalid");

  await getPrisma().client.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: {
      name: parsed.data.name,
      company: parsed.data.company || null,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      document: isDemoMode() ? null : parsed.data.document || null,
      type: parsed.data.type,
      source: parsed.data.source,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients/${parsed.data.id}?updated=1`);
}

export async function deleteClientAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  if (!id) redirect("/dashboard/clients?error=invalid");

  await getPrisma().client.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients?deleted=1");
}
