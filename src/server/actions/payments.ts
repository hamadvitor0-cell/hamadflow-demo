"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { generateClientMessage } from "@/lib/ai";
import { getPrisma } from "@/lib/prisma";
import {
  formString,
  parseDate,
  parseMoney,
} from "@/lib/utils";
import { paymentSchema } from "@/lib/validations";

function paymentPayload(formData: FormData) {
  return {
    id: formString(formData, "id"),
    clientId: formString(formData, "clientId"),
    projectId: formString(formData, "projectId"),
    description: formString(formData, "description"),
    amount: parseMoney(formData.get("amount")),
    dueDate: parseDate(formData.get("dueDate")) ?? new Date(),
    paidAt: parseDate(formData.get("paidAt")),
    status: formString(formData, "status") || "PENDENTE",
    method: formString(formData, "method") || "PIX",
    notes: formString(formData, "notes"),
  };
}

export async function createPaymentAction(formData: FormData) {
  const user = await requireUser();
  const parsed = paymentSchema.safeParse(paymentPayload(formData));
  if (!parsed.success) redirect("/dashboard/payments/new?error=invalid");

  const payment = await getPrisma().payment.create({
    data: {
      userId: user.id,
      clientId: parsed.data.clientId,
      projectId: parsed.data.projectId || null,
      description: parsed.data.description,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate,
      paidAt: parsed.data.paidAt,
      status: parsed.data.status,
      method: parsed.data.method,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/dashboard/payments");
  redirect(`/dashboard/payments/${payment.id}/edit?created=1`);
}

export async function updatePaymentAction(formData: FormData) {
  const user = await requireUser();
  const parsed = paymentSchema.safeParse(paymentPayload(formData));
  if (!parsed.success || !parsed.data.id) redirect("/dashboard/payments?error=invalid");

  await getPrisma().payment.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: {
      clientId: parsed.data.clientId,
      projectId: parsed.data.projectId || null,
      description: parsed.data.description,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate,
      paidAt: parsed.data.paidAt,
      status: parsed.data.status,
      method: parsed.data.method,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/dashboard/payments");
  redirect("/dashboard/payments?updated=1");
}

export async function deletePaymentAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  await getPrisma().payment.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/payments");
  redirect("/dashboard/payments?deleted=1");
}

export async function generateCollectionMessageAction(formData: FormData) {
  const user = await requireUser();
  const paymentId = formString(formData, "paymentId");
  const type = (formString(formData, "type") || "educada") as
    | "educada"
    | "direta"
    | "firme";

  const payment = await getPrisma().payment.findFirst({
    where: { id: paymentId, userId: user.id },
    include: { client: true, project: true },
  });
  if (!payment) redirect("/dashboard/payments?error=not-found");

  const result = await generateClientMessage(type, payment);
  const log = await getPrisma().aiGenerationLog.create({
    data: {
      userId: user.id,
      type: "CLIENT_MESSAGE",
      input: { paymentId, tone: type },
      output: result.data,
      model: result.model,
      status: result.status,
      error: result.error,
    },
  });

  revalidatePath("/dashboard/payments");
  redirect(`/dashboard/payments?messageId=${log.id}`);
}
