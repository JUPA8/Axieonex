/**
 * Creates (or updates the password for) an AXIEONEX admin account.
 * Never invents credentials — reads them from you, one way or another:
 *
 *   pnpm admin:create --email you@example.com --password "a real password"
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD="a real password" pnpm admin:create
 *   pnpm admin:create                      # prompts interactively
 *
 * Requires DATABASE_URL to be set (reads from .env.local automatically via
 * Next.js conventions is NOT active here since this runs outside Next — load
 * it yourself first, e.g. `set -a && source .env.local && set +a`).
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const direct = process.argv.find((arg) => arg.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);

  const flagIndex = process.argv.indexOf(`--${name}`);
  if (flagIndex !== -1 && process.argv[flagIndex + 1]) return process.argv[flagIndex + 1];
  return undefined;
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

async function main() {
  let email = readArg("email") ?? process.env.ADMIN_EMAIL;
  let password = readArg("password") ?? process.env.ADMIN_PASSWORD;

  if (!email) email = await prompt("Admin email: ");
  if (!password) password = await prompt("Admin password (min 12 characters): ");

  email = email.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    console.error("A valid email is required.");
    process.exit(1);
  }
  if (!password || password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Load it first, e.g.:\n  set -a && source .env.local && set +a && pnpm admin:create");
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });
    console.log(`Admin ready: ${admin.email} (id ${admin.id})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to create admin:", error);
  process.exit(1);
});
