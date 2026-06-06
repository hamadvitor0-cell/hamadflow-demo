import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { resetDemoData } from "../src/lib/demo-data";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nao configurada.");
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

resetDemoData(prisma)
  .then((result) => {
    console.log(`Seed concluido: ${result.email} / demo123456`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
