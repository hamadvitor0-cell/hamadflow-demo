import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resetDemoData } from "@/lib/demo-data";
import {
  DEMO_USER_EMAIL,
  isDemoMode,
  isDemoResetEnabled,
} from "@/lib/demo";
import { getPrisma } from "@/lib/prisma";

export async function POST() {
  if (!isDemoMode() || !isDemoResetEnabled()) {
    return NextResponse.json(
      { success: false, message: "Reset disponível somente no ambiente demo." },
      { status: 403 },
    );
  }

  const user = await getCurrentUser();
  if (!user || user.email !== DEMO_USER_EMAIL) {
    return NextResponse.json(
      { success: false, message: "Apenas o usuário demo autenticado pode resetar os dados." },
      { status: 403 },
    );
  }

  await resetDemoData(getPrisma());
  return NextResponse.json({
    success: true,
    message: "Dados fictícios restaurados.",
  });
}
