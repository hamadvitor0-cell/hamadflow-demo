"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createPublicToken } from "@/lib/tokens";
import {
  formString,
  listFromText,
  parseDate,
  parseMoney,
} from "@/lib/utils";
import { projectSchema, taskSchema } from "@/lib/validations";

function projectPayload(formData: FormData) {
  return {
    id: formString(formData, "id"),
    clientId: formString(formData, "clientId"),
    proposalId: formString(formData, "proposalId"),
    contractId: formString(formData, "contractId"),
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    status: formString(formData, "status") || "ORCAMENTO",
    startDate: parseDate(formData.get("startDate")),
    dueDate: parseDate(formData.get("dueDate")),
    value: parseMoney(formData.get("value")),
    notes: formString(formData, "notes"),
    links: listFromText(formData.get("links")),
  };
}

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const parsed = projectSchema.safeParse(projectPayload(formData));
  if (!parsed.success) redirect("/dashboard/projects/new?error=invalid");

  const project = await getPrisma().project.create({
    data: {
      userId: user.id,
      clientId: parsed.data.clientId,
      proposalId: parsed.data.proposalId || null,
      contractId: parsed.data.contractId || null,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      startDate: parsed.data.startDate,
      dueDate: parsed.data.dueDate,
      value: parsed.data.value,
      notes: parsed.data.notes || null,
      links: parsed.data.links,
      publicToken: createPublicToken(),
    },
  });

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${project.id}?created=1`);
}

export async function updateProjectAction(formData: FormData) {
  const user = await requireUser();
  const parsed = projectSchema.safeParse(projectPayload(formData));
  if (!parsed.success || !parsed.data.id) redirect("/dashboard/projects?error=invalid");

  await getPrisma().project.updateMany({
    where: { id: parsed.data.id, userId: user.id },
    data: {
      clientId: parsed.data.clientId,
      proposalId: parsed.data.proposalId || null,
      contractId: parsed.data.contractId || null,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      startDate: parsed.data.startDate,
      dueDate: parsed.data.dueDate,
      value: parsed.data.value,
      notes: parsed.data.notes || null,
      links: parsed.data.links,
    },
  });

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${parsed.data.id}?updated=1`);
}

export async function deleteProjectAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  if (!id) redirect("/dashboard/projects?error=invalid");
  await getPrisma().project.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects?deleted=1");
}

export async function createTaskAction(formData: FormData) {
  const user = await requireUser();
  const payload = {
    projectId: formString(formData, "projectId"),
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    status: formString(formData, "status") || "PENDENTE",
    priority: formString(formData, "priority") || "MEDIA",
    dueDate: parseDate(formData.get("dueDate")),
  };
  const parsed = taskSchema.safeParse(payload);
  if (!parsed.success) redirect("/dashboard/projects?error=invalid-task");

  const project = await getPrisma().project.findFirst({
    where: { id: parsed.data.projectId, userId: user.id },
    select: { id: true },
  });
  if (!project) redirect("/dashboard/projects?error=not-found");

  await getPrisma().task.create({
    data: {
      userId: user.id,
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate,
    },
  });

  revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
  redirect(`/dashboard/projects/${parsed.data.projectId}?task=created`);
}

export async function updateTaskStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  const projectId = formString(formData, "projectId");
  const status = formString(formData, "status") || "CONCLUIDA";
  await getPrisma().task.updateMany({
    where: { id, userId: user.id, projectId },
    data: { status: status as "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" },
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteTaskAction(formData: FormData) {
  const user = await requireUser();
  const id = formString(formData, "id");
  const projectId = formString(formData, "projectId");
  await getPrisma().task.deleteMany({ where: { id, userId: user.id, projectId } });
  revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(`/dashboard/projects/${projectId}`);
}
