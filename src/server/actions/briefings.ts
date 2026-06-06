"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { generateProposalFromBriefing, generateStructuredBriefing } from "@/lib/ai";
import { getPrisma } from "@/lib/prisma";
import { createPublicToken } from "@/lib/tokens";
import {
  formString,
  listFromText,
  parseMoney,
} from "@/lib/utils";
import { briefingSchema } from "@/lib/validations";

function briefingPayload(formData: FormData) {
  return {
    id: formString(formData, "id"),
    clientId: formString(formData, "clientId"),
    title: formString(formData, "title"),
    rawInput: formString(formData, "rawInput"),
    projectType: formString(formData, "projectType"),
    objective: formString(formData, "objective"),
    targetAudience: formString(formData, "targetAudience"),
    pages: listFromText(formData.get("pages")),
    features: listFromText(formData.get("features")),
    optionalFeatures: listFromText(formData.get("optionalFeatures")),
    missingInfo: listFromText(formData.get("missingInfo")),
    risks: listFromText(formData.get("risks")),
    suggestedTimeline: formString(formData, "suggestedTimeline"),
    complexity: formString(formData, "complexity") || "MEDIA",
    suggestedPriceMin: parseMoney(formData.get("suggestedPriceMin")),
    suggestedPriceMax: parseMoney(formData.get("suggestedPriceMax")),
    nextQuestions: listFromText(formData.get("nextQuestions")),
  };
}

export async function createBriefingAction(formData: FormData) {
  const user = await requireUser();
  const useAi = formString(formData, "mode") === "ai";
  const rawInput = formString(formData, "rawInput");
  let payload = briefingPayload(formData);

  if (useAi && rawInput) {
    const result = await generateStructuredBriefing(rawInput);
    payload = {
      ...payload,
      projectType: result.data.projectType,
      objective: result.data.objective,
      targetAudience: result.data.targetAudience ?? "",
      pages: result.data.pages,
      features: result.data.features,
      optionalFeatures: result.data.optionalFeatures,
      missingInfo: result.data.missingInfo,
      risks: result.data.risks,
      suggestedTimeline: result.data.suggestedTimeline ?? "",
      complexity: result.data.complexity,
      suggestedPriceMin: result.data.suggestedPriceMin,
      suggestedPriceMax: result.data.suggestedPriceMax,
      nextQuestions: result.data.nextQuestions,
    };

    await getPrisma().aiGenerationLog.create({
      data: {
        userId: user.id,
        type: "BRIEFING",
        provider: result.provider,
        input: { rawInput },
        output: result.data,
        model: result.model,
        status: result.status,
        error: result.error,
      },
    });
  }

  const parsed = briefingSchema.safeParse(payload);
  if (!parsed.success) redirect("/dashboard/briefings/new?error=invalid");

  const client = await getPrisma().client.findFirst({
    where: { id: parsed.data.clientId, userId: user.id },
    select: { id: true },
  });
  if (!client) redirect("/dashboard/briefings/new?error=client");

  const briefing = await getPrisma().briefing.create({
    data: {
      ...parsed.data,
      id: undefined,
      rawInput: parsed.data.rawInput || null,
      targetAudience: parsed.data.targetAudience || null,
      suggestedTimeline: parsed.data.suggestedTimeline || null,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard/briefings");
  redirect(`/dashboard/briefings/${briefing.id}?created=1`);
}

export async function updateBriefingAction(formData: FormData) {
  const user = await requireUser();
  const parsed = briefingSchema.safeParse(briefingPayload(formData));
  if (!parsed.success || !parsed.data.id) redirect("/dashboard/briefings?error=invalid");

  await getPrisma().briefing.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: {
      clientId: parsed.data.clientId,
      title: parsed.data.title,
      rawInput: parsed.data.rawInput || null,
      projectType: parsed.data.projectType,
      objective: parsed.data.objective,
      targetAudience: parsed.data.targetAudience || null,
      pages: parsed.data.pages,
      features: parsed.data.features,
      optionalFeatures: parsed.data.optionalFeatures,
      missingInfo: parsed.data.missingInfo,
      risks: parsed.data.risks,
      suggestedTimeline: parsed.data.suggestedTimeline || null,
      complexity: parsed.data.complexity,
      suggestedPriceMin: parsed.data.suggestedPriceMin,
      suggestedPriceMax: parsed.data.suggestedPriceMax,
      nextQuestions: parsed.data.nextQuestions,
    },
  });

  revalidatePath("/dashboard/briefings");
  redirect(`/dashboard/briefings/${parsed.data.id}?updated=1`);
}

export async function deleteBriefingAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  if (!id) redirect("/dashboard/briefings?error=invalid");
  await getPrisma().briefing.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/briefings");
  redirect("/dashboard/briefings?deleted=1");
}

export async function generateProposalFromBriefingAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  const prisma = getPrisma();
  const briefing = await prisma.briefing.findFirst({
    where: { id, userId: user.id },
    include: { client: true },
  });

  if (!briefing) redirect("/dashboard/briefings?error=not-found");

  const result = await generateProposalFromBriefing(briefing);
  const proposal = await prisma.proposal.create({
    data: {
      userId: user.id,
      clientId: briefing.clientId,
      briefingId: briefing.id,
      title: result.data.title,
      summary: result.data.summary,
      includedScope: result.data.includedScope,
      excludedScope: result.data.excludedScope,
      deliverables: result.data.deliverables,
      milestones: result.data.milestones,
      timeline: result.data.timeline,
      totalPrice: result.data.totalPrice,
      paymentTerms: result.data.paymentTerms,
      notes: result.data.notes || null,
      status: "RASCUNHO",
      publicToken: createPublicToken(),
    },
  });

  await prisma.aiGenerationLog.create({
    data: {
      userId: user.id,
      type: "PROPOSAL",
      provider: result.provider,
      input: { briefingId: briefing.id },
      output: result.data,
      model: result.model,
      status: result.status,
      error: result.error,
    },
  });

  revalidatePath("/dashboard/proposals");
  redirect(`/dashboard/proposals/${proposal.id}/edit?generated=1`);
}
