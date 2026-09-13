import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Prisma 7 requires a driver adapter up front — `new PrismaClient()`
    // with none throws immediately at construction, not lazily on the
    // first query. Throwing here (rather than constructing without an
    // adapter) keeps that failure inside whichever try/catch actually
    // triggered client creation — contactProvider/bookingProvider catch it
    // and report an honest "not configured" state instead of crashing.
    throw new Error("DATABASE_URL is not set.");
  }
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    // Stashed on globalThis so Next.js dev's hot-reload (which
    // re-evaluates this module on every edit) reuses one connection pool
    // instead of opening a fresh one per reload until it's exhausted.
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Proxy instead of an eagerly-constructed client: constructing without
 * DATABASE_URL throws (see above), and this module is imported at the top
 * of files across the app (admin pages, auth.ts, the form providers). An
 * eager `export const prisma = createClient()` would throw at import time,
 * before any caller's try/catch exists to catch it. Proxying defers that
 * throw to the first actual property access (e.g. `prisma.admin.findUnique`),
 * which happens inside the caller's own try/catch.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
