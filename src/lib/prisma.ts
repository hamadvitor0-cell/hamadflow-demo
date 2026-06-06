import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  hamadflowDemoPrisma?: PrismaClient;
};

function normalizeConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get("sslmode");

    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

export function getPrisma() {
  if (!globalForPrisma.hamadflowDemoPrisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL nao configurada. Copie .env.example para .env e configure um PostgreSQL.");
    }

    globalForPrisma.hamadflowDemoPrisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: normalizeConnectionString(connectionString) }),
    });
  }

  return globalForPrisma.hamadflowDemoPrisma;
}
