import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_USER_EMAIL } from "../src/lib/demo";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL ausente.");
}

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
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: {
      id: true,
      document: true,
      pixKey: true,
    },
  });

  if (!user) throw new Error("Usuario demo nao encontrado.");
  if (user.document || user.pixKey) {
    throw new Error("Usuario demo possui documento ou Pix preenchido.");
  }

  const [
    leads,
    clients,
    briefings,
    proposals,
    contracts,
    projects,
    payments,
    tasks,
    comments,
    clientDocuments,
    nonDemoSources,
  ] = await Promise.all([
    prisma.lead.count({ where: { userId: user.id } }),
    prisma.client.count({ where: { userId: user.id } }),
    prisma.briefing.count({ where: { userId: user.id } }),
    prisma.proposal.count({ where: { userId: user.id } }),
    prisma.contract.count({ where: { userId: user.id } }),
    prisma.project.count({ where: { userId: user.id } }),
    prisma.payment.count({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id } }),
    prisma.comment.count({ where: { userId: user.id } }),
    prisma.client.count({ where: { userId: user.id, document: { not: null } } }),
    prisma.lead.count({ where: { userId: user.id, source: { not: "demo" } } }),
  ]);

  const expectedMinimums = {
    leads: 5,
    clients: 5,
    briefings: 5,
    proposals: 5,
    contracts: 3,
    projects: 5,
    payments: 10,
    tasks: 10,
    comments: 10,
  };

  const counts = {
    leads,
    clients,
    briefings,
    proposals,
    contracts,
    projects,
    payments,
    tasks,
    comments,
  };

  for (const [key, minimum] of Object.entries(expectedMinimums)) {
    if (counts[key as keyof typeof counts] < minimum) {
      throw new Error(`${key} abaixo do minimo esperado.`);
    }
  }

  if (clientDocuments !== 0) throw new Error("Existem documentos de clientes na demo.");
  if (nonDemoSources !== 0) throw new Error("Existem pedidos com origem diferente de demo.");

  console.log(JSON.stringify({ ok: true, counts }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
