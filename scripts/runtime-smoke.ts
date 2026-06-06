import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_USER_EMAIL } from "../src/lib/demo";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL ausente.");
}

const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: normalizeConnectionString(process.env.DATABASE_URL),
  }),
});

function normalizeConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}

async function main() {
  const proposal = await prisma.proposal.findFirst({
    where: { user: { email: DEMO_USER_EMAIL } },
    select: { publicToken: true },
    orderBy: { createdAt: "asc" },
  });

  if (!proposal) throw new Error("Proposta demo não encontrada.");

  const publicPage = await fetch(`${baseUrl}/client/proposal/${proposal.publicToken}`);
  const publicHtml = await publicPage.text();
  if (!publicPage.ok || !publicHtml.includes("HamadFlow Demo")) {
    throw new Error("Link público da proposta falhou.");
  }

  const pdf = await fetch(`${baseUrl}/api/public/proposals/${proposal.publicToken}/pdf`);
  if (!pdf.ok || !pdf.headers.get("content-type")?.includes("application/pdf")) {
    throw new Error("PDF público da proposta falhou.");
  }

  const leadResponse = await fetch(`${baseUrl}/api/public/portfolio-request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Cliente de Teste",
      companyName: "Empresa Demo",
      email: "runtime@example.com",
      phone: "+55 41 99999-9999",
      projectName: "Landing Page Runtime",
      projectType: "Landing Page",
      budgetRange: "R$ 1.500 a R$ 3.000",
      message: "Pedido fictício criado apenas para o smoke test do ambiente demo.",
    }),
  });
  const leadResult = (await leadResponse.json()) as {
    success?: boolean;
    message?: string;
    leadId?: string;
  };

  if (
    leadResponse.status !== 201 ||
    !leadResult.success ||
    !leadResult.message?.includes("ambiente demo") ||
    !leadResult.leadId
  ) {
    throw new Error("Endpoint público demo falhou.");
  }

  const createdLead = await prisma.lead.findUnique({
    where: { id: leadResult.leadId },
    select: { source: true, convertedClientId: true },
  });
  if (!createdLead || createdLead.source !== "demo" || createdLead.convertedClientId) {
    throw new Error("Pedido de teste não ficou isolado como lead demo.");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        publicProposal: publicPage.status,
        publicPdf: pdf.status,
        demoLeadEndpoint: leadResponse.status,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
