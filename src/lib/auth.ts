import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";
import { getPrisma } from "@/lib/prisma";

export const sessionCookieName = "hamadflow_demo_session";

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET nao configurado");
  }

  return new TextEncoder().encode(
    secret || "hamadflow-demo-development-secret-change-me-now",
  );
}

export async function createSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const store = await cookies();
  store.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(sessionCookieName);
}

export async function getSessionUserId() {
  const store = await cookies();
  const token = store.get(sessionCookieName)?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, getSecret());
    return verified.payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return getPrisma().user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      brandName: true,
      phone: true,
      website: true,
      document: true,
      logoUrl: true,
      pixKey: true,
      footerText: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
