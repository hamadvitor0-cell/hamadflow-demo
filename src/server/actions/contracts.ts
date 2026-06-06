"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createPublicToken } from "@/lib/tokens";
import {
  formString,
  listFromText,
  parseMoney,
} from "@/lib/utils";
import { contractSchema } from "@/lib/validations";

function contractPayload(formData: FormData) {
  return {
    id: formString(formData, "id"),
    clientId: formString(formData, "clientId"),
    proposalId: formString(formData, "proposalId"),
    title: formString(formData, "title"),
    contractorData: formString(formData, "contractorData"),
    clientData: formString(formData, "clientData"),
    object: formString(formData, "object"),
    scope: formString(formData, "scope"),
    totalPrice: parseMoney(formData.get("totalPrice")),
    paymentTerms: formString(formData, "paymentTerms"),
    deadline: formString(formData, "deadline"),
    includedRevisions: Number(formData.get("includedRevisions") || 0),
    freelancerResponsibilities: listFromText(formData.get("freelancerResponsibilities")),
    clientResponsibilities: listFromText(formData.get("clientResponsibilities")),
    cancellationTerms: formString(formData, "cancellationTerms"),
    penaltyTerms: formString(formData, "penaltyTerms"),
    rightsAndOwnership: formString(formData, "rightsAndOwnership"),
    supportTerms: formString(formData, "supportTerms"),
    additionalClauses: listFromText(formData.get("additionalClauses")),
    status: formString(formData, "status") || "RASCUNHO",
  };
}

export async function createContractAction(formData: FormData) {
  const user = await requireUser();
  const parsed = contractSchema.safeParse(contractPayload(formData));
  if (!parsed.success) redirect("/dashboard/contracts/new?error=invalid");

  const contract = await getPrisma().contract.create({
    data: {
      userId: user.id,
      clientId: parsed.data.clientId,
      proposalId: parsed.data.proposalId || null,
      title: parsed.data.title,
      contractorData: parsed.data.contractorData,
      clientData: parsed.data.clientData,
      object: parsed.data.object,
      scope: parsed.data.scope,
      totalPrice: parsed.data.totalPrice,
      paymentTerms: parsed.data.paymentTerms,
      deadline: parsed.data.deadline,
      includedRevisions: parsed.data.includedRevisions,
      freelancerResponsibilities: parsed.data.freelancerResponsibilities,
      clientResponsibilities: parsed.data.clientResponsibilities,
      cancellationTerms: parsed.data.cancellationTerms,
      penaltyTerms: parsed.data.penaltyTerms || null,
      rightsAndOwnership: parsed.data.rightsAndOwnership,
      supportTerms: parsed.data.supportTerms,
      additionalClauses: parsed.data.additionalClauses,
      status: parsed.data.status,
      publicToken: createPublicToken(),
    },
  });

  revalidatePath("/dashboard/contracts");
  redirect(`/dashboard/contracts/${contract.id}?created=1`);
}

export async function updateContractAction(formData: FormData) {
  const user = await requireUser();
  const parsed = contractSchema.safeParse(contractPayload(formData));
  if (!parsed.success || !parsed.data.id) redirect("/dashboard/contracts?error=invalid");

  await getPrisma().contract.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: {
      clientId: parsed.data.clientId,
      proposalId: parsed.data.proposalId || null,
      title: parsed.data.title,
      contractorData: parsed.data.contractorData,
      clientData: parsed.data.clientData,
      object: parsed.data.object,
      scope: parsed.data.scope,
      totalPrice: parsed.data.totalPrice,
      paymentTerms: parsed.data.paymentTerms,
      deadline: parsed.data.deadline,
      includedRevisions: parsed.data.includedRevisions,
      freelancerResponsibilities: parsed.data.freelancerResponsibilities,
      clientResponsibilities: parsed.data.clientResponsibilities,
      cancellationTerms: parsed.data.cancellationTerms,
      penaltyTerms: parsed.data.penaltyTerms || null,
      rightsAndOwnership: parsed.data.rightsAndOwnership,
      supportTerms: parsed.data.supportTerms,
      additionalClauses: parsed.data.additionalClauses,
      status: parsed.data.status,
    },
  });

  revalidatePath("/dashboard/contracts");
  redirect(`/dashboard/contracts/${parsed.data.id}?updated=1`);
}

export async function deleteContractAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  if (!id) redirect("/dashboard/contracts?error=invalid");
  await getPrisma().contract.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/contracts");
  redirect("/dashboard/contracts?deleted=1");
}

export async function acceptPublicContractAction(formData: FormData) {
  const token = formString(formData, "token");
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "nao identificado";
  const userAgent = headerStore.get("user-agent") || "nao identificado";

  const contract = await getPrisma().contract.findUnique({
    where: { publicToken: token },
  });
  if (!contract) redirect("/");

  await getPrisma().contract.update({
    where: { id: contract.id },
    data: {
      status: "ACEITO",
      acceptedAt: new Date(),
      acceptedIp: ip,
      acceptedUserAgent: userAgent,
      rejectedAt: null,
      rejectionReason: null,
    },
  });

  revalidatePath(`/client/contract/${token}`);
  redirect(`/client/contract/${token}?accepted=1`);
}

export async function rejectPublicContractAction(formData: FormData) {
  const token = formString(formData, "token");
  const reason = formString(formData, "reason") || "Contrato recusado pelo cliente.";

  const contract = await getPrisma().contract.findUnique({
    where: { publicToken: token },
  });
  if (!contract) redirect("/");

  await getPrisma().contract.update({
    where: { id: contract.id },
    data: {
      status: "RECUSADO",
      rejectedAt: new Date(),
      rejectionReason: reason,
    },
  });

  revalidatePath(`/client/contract/${token}`);
  redirect(`/client/contract/${token}?rejected=1`);
}
