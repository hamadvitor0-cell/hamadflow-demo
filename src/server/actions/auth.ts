"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import {
  DEMO_USER_EMAIL,
  isDemoLoginEnabled,
  isDemoMode,
  isPublicRegisterAllowed,
} from "@/lib/demo";
import { getPrisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations";

export async function registerAction(formData: FormData) {
  if (!isPublicRegisterAllowed()) redirect("/register?error=disabled");

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    brandName: formData.get("brandName"),
  });

  if (!parsed.success) redirect("/register?error=invalid");

  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) redirect("/register?error=exists");

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      brandName: parsed.data.brandName,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
    select: { id: true },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) redirect("/login?error=invalid");
  if (isDemoMode() && parsed.data.email !== DEMO_USER_EMAIL) {
    redirect("/login?error=invalid");
  }

  const user = await getPrisma().user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, passwordHash: true },
  });

  if (!user) redirect("/login?error=invalid");

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValid) redirect("/login?error=invalid");

  await createSession(user.id);
  redirect("/dashboard");
}

export async function demoLoginAction() {
  if (!isDemoLoginEnabled()) redirect("/login?error=demo-disabled");

  const user = await getPrisma().user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });

  if (!user) redirect("/login?error=seed");

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
