import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildDatabaseUrl() {
  const url = process.env.DATABASE_URL!;
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  if (url.includes("pgbouncer=true")) return url;
  return `${url}${sep}pgbouncer=true&connection_limit=1`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: buildDatabaseUrl() },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
