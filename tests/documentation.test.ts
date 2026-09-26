import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readRepoFile = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("repository documentation", () => {
  it("pins the verified Vercel runtime and production bundler", () => {
    const packageJson = JSON.parse(readRepoFile("package.json")) as {
      engines: { node: string };
      scripts: { build: string };
    };
    expect(packageJson.engines.node).toBe("22.x");
    expect(packageJson.scripts.build).toBe("prisma generate && next build --webpack");
  });

  it("documents every operator-supplied application environment variable", () => {
    const example = readRepoFile(".env.example");
    const integrations = readRepoFile("docs/INTEGRATIONS.md");
    const variables = [
      "NEXT_PUBLIC_SITE_URL", "DATABASE_URL", "AUTH_SECRET", "EMAIL_PROVIDER_API_KEY", "EMAIL_FROM_ADDRESS",
      "CAPTCHA_SITE_KEY", "CAPTCHA_SECRET", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN",
      "TRUSTED_PROXY_IP_HEADER", "NEXT_PUBLIC_CALENDLY_URL", "CALENDLY_WEBHOOK_SIGNING_KEY",
      "CALENDLY_WEBHOOK_USER_URI", "CRM_API_KEY", "CRM_WORKSPACE_ID", "ANALYTICS_PROVIDER_ID",
      "ERROR_MONITORING_DSN",
    ];

    for (const variable of variables) {
      expect(example).toMatch(new RegExp(`^${variable}=$`, "m"));
      expect(integrations).toContain(`\`${variable}\``);
    }
    for (const special of ["ADMIN_EMAIL", "ADMIN_PASSWORD", "NODE_ENV", "NEXT_RUNTIME", "VERCEL_ENV"]) {
      expect(integrations).toContain(`\`${special}\``);
    }
  });

  it("documents implemented integrations without outdated mock claims", () => {
    const readme = readRepoFile("README.md");
    const integrations = readRepoFile("docs/INTEGRATIONS.md");
    expect(readme).not.toContain("What's mocked");
    expect(readme).not.toMatch(/still mocked/i);
    for (const integration of ["Contact form persistence", "Calendar scheduling", "CRM push", "Cookie consent persistence", "Analytics", "Error monitoring"]) {
      expect(integrations).toContain(`| ${integration} |`);
    }
    expect(integrations).toMatch(/There are no silent-success\s+integration mocks/);
  });

  it("documents admin pagination, timestamps, safe provider states, and the forward migration", () => {
    const readme = readRepoFile("README.md");
    const adminOperations = readRepoFile("docs/ADMIN-OPERATIONS.md");
    expect(readme).toContain("docs/ADMIN-OPERATIONS.md");
    expect(adminOperations).toContain("fixed page size of 20");
    expect(adminOperations).toContain("explicitly formatted in UTC");
    for (const state of ["NOT_ATTEMPTED", "DISABLED", "SUCCEEDED", "FAILED", "LEGACY_UNKNOWN"]) {
      expect(adminOperations).toContain(`\`${state}\``);
    }
    expect(adminOperations).toContain("20260925120000_admin_operational_completeness");
    expect(adminOperations).toContain("Provider credentials remained absent");
  });

  it("keeps all 22 unresolved legal fields visible and owner-blocked", () => {
    const legalSource = ["src/content/privacy.tsx", "src/content/terms.tsx", "src/content/cookies.tsx"].map(readRepoFile).join("\n");
    const placeholders = legalSource.match(/\[[A-Z][A-Z\s-]*?(?:TO\s+BE\s+CONFIRMED|CONFIRMED AND PUBLISHED)[A-Z\s-]*?\]/g) ?? [];
    expect(placeholders).toHaveLength(22);
    const checklist = readRepoFile("docs/LEGAL-OWNER-CHECKLIST.md");
    expect(checklist).toContain("Status: owner-blocked and not legally complete.");
    expect(checklist).toContain("| 22 |");
  });
});
