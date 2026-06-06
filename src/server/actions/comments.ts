"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { formString } from "@/lib/utils";
import { commentSchema } from "@/lib/validations";

export async function createDashboardCommentAction(formData: FormData) {
  const user = await requireUser();
  const returnTo = formString(formData, "returnTo") || "/dashboard";
  const parsed = commentSchema.safeParse({
    entityType: formString(formData, "entityType"),
    entityId: formString(formData, "entityId"),
    clientId: formString(formData, "clientId"),
    authorName: user.name,
    content: formString(formData, "content"),
  });
  if (!parsed.success) redirect(`${returnTo}?error=comment`);

  await getPrisma().comment.create({
    data: {
      userId: user.id,
      clientId: parsed.data.clientId || null,
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      authorType: "FREELANCER",
      authorName: user.name,
      content: parsed.data.content,
    },
  });

  revalidatePath(returnTo);
  redirect(`${returnTo}?comment=created`);
}

export async function createPublicCommentAction(formData: FormData) {
  const token = formString(formData, "token");
  const entityType = formString(formData, "entityType");
  const authorName = formString(formData, "authorName") || "Cliente";
  const content = formString(formData, "content");
  const prisma = getPrisma();

  const entity =
    entityType === "PROPOSAL"
      ? await prisma.proposal.findUnique({ where: { publicToken: token } })
      : entityType === "CONTRACT"
        ? await prisma.contract.findUnique({ where: { publicToken: token } })
        : await prisma.project.findUnique({ where: { publicToken: token } });

  if (!entity) redirect("/");

  const parsed = commentSchema.safeParse({
    entityType,
    entityId: entity.id,
    clientId: entity.clientId,
    authorName,
    content,
  });
  if (!parsed.success) redirect(`/client/${entityType.toLowerCase()}/${token}?error=comment`);

  await prisma.comment.create({
    data: {
      userId: entity.userId,
      clientId: entity.clientId,
      entityType: parsed.data.entityType,
      entityId: entity.id,
      authorType: "CLIENTE",
      authorName: parsed.data.authorName,
      content: parsed.data.content,
    },
  });

  const path =
    entityType === "PROPOSAL"
      ? `/client/proposal/${token}`
      : entityType === "CONTRACT"
        ? `/client/contract/${token}`
        : `/client/project/${token}`;
  revalidatePath(path);
  redirect(`${path}?comment=created`);
}
