"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { generateContractFromProposal } from "@/lib/ai";
import { getPrisma } from "@/lib/prisma";
import { createPublicToken } from "@/lib/tokens";
import {
  formString,
  listFromText,
  parseDate,
  parseMoney,
} from "@/lib/utils";
import { proposalSchema } from "@/lib/validations";

function proposalPayload(formData: FormData) {
  return {
    id: formString(formData, "id"),
    clientId: formString(formData, "clientId"),
    briefingId: formString(formData, "briefingId"),
    title: formString(formData, "title"),
    summary: formString(formData, "summary"),
    includedScope: listFromText(formData.get("includedScope")),
    excludedScope: listFromText(formData.get("excludedScope")),
    deliverables: listFromText(formData.get("deliverables")),
    milestones: listFromText(formData.get("milestones")),
    timeline: formString(formData, "timeline"),
    totalPrice: parseMoney(formData.get("totalPrice")),
    paymentTerms: formString(formData, "paymentTerms"),
    validUntil: parseDate(formData.get("validUntil")),
    notes: formString(formData, "notes"),
    status: formString(formData, "status") || "RASCUNHO",
  };
}

export async function createProposalAction(formData: FormData) {
  const user = await requireUser();
  const parsed = proposalSchema.safeParse(proposalPayload(formData));
  if (!parsed.success) redirect("/dashboard/proposals/new?error=invalid");

  const prisma = getPrisma();
  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, userId: user.id },
    select: { id: true },
  });
  if (!client) redirect("/dashboard/proposals/new?error=client");

  const proposal = await prisma.proposal.create({
    data: {
      userId: user.id,
      clientId: parsed.data.clientId,
      briefingId: parsed.data.briefingId || null,
      title: parsed.data.title,
      summary: parsed.data.summary,
      includedScope: parsed.data.includedScope,
      excludedScope: parsed.data.excludedScope,
      deliverables: parsed.data.deliverables,
      milestones: parsed.data.milestones,
      timeline: parsed.data.timeline,
      totalPrice: parsed.data.totalPrice,
      paymentTerms: parsed.data.paymentTerms,
      validUntil: parsed.data.validUntil,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
      publicToken: createPublicToken(),
    },
  });

  revalidatePath("/dashboard/proposals");
  redirect(`/dashboard/proposals/${proposal.id}?created=1`);
}

export async function updateProposalAction(formData: FormData) {
  const user = await requireUser();
  const parsed = proposalSchema.safeParse(proposalPayload(formData));
  if (!parsed.success || !parsed.data.id) redirect("/dashboard/proposals?error=invalid");

  await getPrisma().proposal.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: {
      clientId: parsed.data.clientId,
      briefingId: parsed.data.briefingId || null,
      title: parsed.data.title,
      summary: parsed.data.summary,
      includedScope: parsed.data.includedScope,
      excludedScope: parsed.data.excludedScope,
      deliverables: parsed.data.deliverables,
      milestones: parsed.data.milestones,
      timeline: parsed.data.timeline,
      totalPrice: parsed.data.totalPrice,
      paymentTerms: parsed.data.paymentTerms,
      validUntil: parsed.data.validUntil,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
    },
  });

  revalidatePath("/dashboard/proposals");
  redirect(`/dashboard/proposals/${parsed.data.id}?updated=1`);
}

export async function deleteProposalAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  if (!id) redirect("/dashboard/proposals?error=invalid");
  await getPrisma().proposal.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/proposals");
  redirect("/dashboard/proposals?deleted=1");
}

export async function duplicateProposalAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  const proposal = await getPrisma().proposal.findFirst({
    where: { id, userId: user.id },
  });
  if (!proposal) redirect("/dashboard/proposals?error=not-found");

  const copy = await getPrisma().proposal.create({
    data: {
      userId: proposal.userId,
      clientId: proposal.clientId,
      briefingId: proposal.briefingId,
      title: `Copia de ${proposal.title}`,
      summary: proposal.summary,
      includedScope: proposal.includedScope,
      excludedScope: proposal.excludedScope,
      deliverables: proposal.deliverables,
      milestones: proposal.milestones,
      timeline: proposal.timeline,
      totalPrice: proposal.totalPrice,
      paymentTerms: proposal.paymentTerms,
      validUntil: proposal.validUntil,
      notes: proposal.notes,
      status: "RASCUNHO",
      publicToken: createPublicToken(),
    },
  });

  revalidatePath("/dashboard/proposals");
  redirect(`/dashboard/proposals/${copy.id}/edit?duplicated=1`);
}

export async function markProposalSentAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  await getPrisma().proposal.updateMany({
    where: { id, userId: user.id },
    data: { status: "ENVIADA" },
  });
  revalidatePath("/dashboard/proposals");
  redirect(`/dashboard/proposals/${id}?sent=1`);
}

export async function generateContractFromProposalAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  const prisma = getPrisma();
  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: user.id },
    include: { client: true, user: true },
  });
  if (!proposal) redirect("/dashboard/proposals?error=not-found");

  const result = await generateContractFromProposal(proposal);
  const contract = await prisma.contract.create({
    data: {
      userId: user.id,
      clientId: proposal.clientId,
      proposalId: proposal.id,
      title: result.data.title,
      contractorData:
        result.data.contractorData || `${proposal.user.brandName} - ${proposal.user.email}`,
      clientData:
        result.data.clientData ||
        `${proposal.client.name} - ${proposal.client.email}`,
      object: result.data.object,
      scope: result.data.scope,
      totalPrice: result.data.totalPrice || proposal.totalPrice,
      paymentTerms: result.data.paymentTerms,
      deadline: result.data.deadline,
      includedRevisions: result.data.includedRevisions,
      freelancerResponsibilities: result.data.freelancerResponsibilities,
      clientResponsibilities: result.data.clientResponsibilities,
      cancellationTerms: result.data.cancellationTerms,
      penaltyTerms: result.data.penaltyTerms || null,
      rightsAndOwnership: result.data.rightsAndOwnership,
      supportTerms: result.data.supportTerms,
      additionalClauses: result.data.additionalClauses,
      status: "RASCUNHO",
      publicToken: createPublicToken(),
    },
  });

  await prisma.aiGenerationLog.create({
    data: {
      userId: user.id,
      type: "CONTRACT",
      provider: result.provider,
      input: { proposalId: proposal.id },
      output: result.data,
      model: result.model,
      status: result.status,
      error: result.error,
    },
  });

  revalidatePath("/dashboard/contracts");
  redirect(`/dashboard/contracts/${contract.id}/edit?generated=1`);
}

export async function convertProposalToProjectAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  const prisma = getPrisma();
  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: user.id },
    include: { contracts: true },
  });
  if (!proposal) redirect("/dashboard/proposals?error=not-found");

  const existing = await prisma.project.findFirst({
    where: { proposalId: proposal.id, userId: user.id },
    select: { id: true },
  });
  if (existing) redirect(`/dashboard/projects/${existing.id}`);

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      clientId: proposal.clientId,
      proposalId: proposal.id,
      contractId: proposal.contracts[0]?.id ?? null,
      name: proposal.title,
      description: proposal.summary,
      status: proposal.status === "APROVADA" ? "APROVADO" : "ORCAMENTO",
      dueDate: null,
      value: proposal.totalPrice,
      publicToken: createPublicToken(),
    },
  });

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${project.id}?created=1`);
}

export async function approvePublicProposalAction(formData: FormData) {
  const token = formString(formData, "token");
  const prisma = getPrisma();
  const proposal = await prisma.proposal.findUnique({
    where: { publicToken: token },
    include: { contracts: true },
  });
  if (!proposal) redirect("/");

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "APROVADA", approvedAt: new Date(), rejectedAt: null, rejectionReason: null },
  });

  const existingProject = await prisma.project.findFirst({
    where: { proposalId: proposal.id },
    select: { id: true },
  });

  if (!existingProject) {
    await prisma.project.create({
      data: {
        userId: proposal.userId,
        clientId: proposal.clientId,
        proposalId: proposal.id,
        contractId: proposal.contracts[0]?.id ?? null,
        name: proposal.title,
        description: proposal.summary,
        status: "APROVADO",
        value: proposal.totalPrice,
        publicToken: createPublicToken(),
      },
    });
  }

  revalidatePath(`/client/proposal/${token}`);
  redirect(`/client/proposal/${token}?approved=1`);
}

export async function rejectPublicProposalAction(formData: FormData) {
  const token = formString(formData, "token");
  const reason = formString(formData, "reason") || "Recusada pelo cliente.";
  const proposal = await getPrisma().proposal.findUnique({
    where: { publicToken: token },
  });
  if (!proposal) redirect("/");

  await getPrisma().proposal.update({
    where: { id: proposal.id },
    data: { status: "RECUSADA", rejectedAt: new Date(), rejectionReason: reason },
  });

  revalidatePath(`/client/proposal/${token}`);
  redirect(`/client/proposal/${token}?rejected=1`);
}
