// Prisma 7 config for the CLI (migrate/generate/studio). The Next.js app
// itself never imports this file, it constructs PrismaClient with a
// driver adapter directly (see src/lib/prisma.ts), reading DATABASE_URL the
// normal Next.js way. This file exists only so `prisma migrate`/`generate`/
// `studio` know where the schema, migrations, and DB connection are when
// run standalone outside the Next.js process (where .env.local isn't
// loaded automatically).
// Bare `dotenv/config` only loads `.env`; this project follows Next.js's
// convention of keeping local secrets in `.env.local` instead, so it's
// loaded explicitly. Harmless no-op in production, where real env vars are
// injected by the platform rather than read from a file.
import { config } from "dotenv";
config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
