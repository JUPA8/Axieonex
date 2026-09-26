import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "prisma/migrations/20260925120000_admin_operational_completeness/migration.sql"),
  "utf8",
);

describe("admin operational-completeness migration", () => {
  it("backfills timestamps and provider evidence conservatively", () => {
    expect(migration).toContain('CREATE TYPE "ProviderOperationState"');
    expect(migration.match(/ADD COLUMN "updatedAt" TIMESTAMP\(3\)/g)).toHaveLength(2);
    expect(migration.match(/WHEN "emailSentAt" IS NOT NULL THEN 'SUCCEEDED'/g)).toHaveLength(2);
    expect(migration.match(/WHEN "crmSyncedAt" IS NOT NULL THEN 'SUCCEEDED'/g)).toHaveLength(2);
    expect(migration.match(/ELSE 'LEGACY_UNKNOWN'/g)).toHaveLength(4);
    expect(migration).not.toMatch(/ELSE 'FAILED'/);
    expect(migration.match(/ALTER COLUMN "updatedAt" SET NOT NULL/g)).toHaveLength(2);
    expect(migration.match(/SET DEFAULT 'NOT_ATTEMPTED'/g)).toHaveLength(4);
  });
});
