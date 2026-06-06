import { NextResponse, type NextRequest } from "next/server";
import { DEMO_USER_EMAIL, isDemoMode } from "@/lib/demo";
import { getPrisma } from "@/lib/prisma";
import { demoPortfolioRequestSchema } from "@/lib/portfolio-request";

const successMessage =
  "Pedido recebido no ambiente demo. Nenhuma informação será enviada para o workflow real.";

function allowedOrigin(origin: string | null) {
  if (!origin) return true;

  const appOrigin = process.env.APP_URL
    ? new URL(process.env.APP_URL).origin
    : "http://localhost:3000";

  return origin === appOrigin || /^http:\/\/localhost:\d+$/.test(origin);
}

export async function OPTIONS(request: NextRequest) {
  if (!allowedOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ success: false, message: "Origem não permitida." }, { status: 403 });
  }

  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { success: false, message: "Endpoint disponível somente na demo." },
      { status: 403 },
    );
  }

  if (!allowedOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ success: false, message: "Origem não permitida." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = demoPortfolioRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Revise os dados fictícios enviados." },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });

  if (!demoUser) {
    return NextResponse.json(
      { success: false, message: "Execute o seed demo antes de criar pedidos." },
      { status: 503 },
    );
  }

  const lead = await prisma.lead.create({
    data: {
      userId: demoUser.id,
      name: parsed.data.name,
      isCompany: Boolean(parsed.data.companyName),
      companyName: parsed.data.companyName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      projectName: parsed.data.projectName,
      projectType: parsed.data.projectType,
      budgetRange: parsed.data.budgetRange,
      message: parsed.data.message,
      source: "demo",
      status: "NOVO",
    },
    select: { id: true },
  });

  return NextResponse.json(
    {
      success: true,
      message: successMessage,
      notice: "Pedido criado apenas na demo.",
      leadId: lead.id,
    },
    { status: 201 },
  );
}
