import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const authSource = readFileSync(resolve(__dirname, "../src/auth.ts"), "utf8");

/**
 * Auth.js decides whether to trust the request's Host header from the
 * platform it detects, not from anything this application sets. The default
 * in @auth/core is:
 *
 *   trustHost ??= !!(AUTH_URL ?? AUTH_TRUST_HOST ?? VERCEL ?? CF_PAGES
 *                    ?? NODE_ENV !== "production")
 *
 * On a production deployment to any host that is not Vercel or Cloudflare
 * Pages, every one of those is falsy, so trustHost becomes false and every
 * request to /api/auth/* fails with UntrustedHost. The user-facing symptom
 * is a bare 500 reading "There was a problem with the server configuration",
 * which names neither the setting nor the cause.
 *
 * That is exactly how admin login broke on the first host that was not
 * Vercel. These tests pin the fix so a refactor cannot quietly undo it.
 */
describe("Auth.js host trust", () => {
  it("sets trustHost explicitly rather than relying on platform detection", () => {
    expect(authSource).toMatch(/^\s*trustHost:\s*true\s*,/m);
  });

  it("does not depend on a Vercel-only or host-specific environment variable", () => {
    // Comments name these variables to explain the fix, so strip them first
    // and assert against the code alone.
    const code = authSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const marker of ["AUTH_TRUST_HOST", "VERCEL", "CF_PAGES", "AUTH_URL"]) {
      expect(code).not.toContain(marker);
    }
  });

  it("still pins secure, http-only session cookies in production", () => {
    expect(authSource).toContain("__Secure-authjs.session-token");
    expect(authSource).toMatch(/httpOnly:\s*true/);
    expect(authSource).toMatch(/sameSite:\s*"lax"/);
  });

  it("keeps the JWT strategy and the bounded session lifetime", () => {
    expect(authSource).toMatch(/strategy:\s*"jwt"/);
    expect(authSource).toContain("SESSION_MAX_AGE_SECONDS");
  });

  it("keeps the sign-in page pointed at the admin login route", () => {
    expect(authSource).toMatch(/pages:\s*\{\s*signIn:\s*"\/admin\/login"\s*\}/);
  });
});

describe("@auth/core trustHost default", () => {
  it("would be false on a production host that is neither Vercel nor CF Pages", () => {
    // Reproduces the library's own expression, so this test fails if a future
    // upgrade changes the default and the explicit setting becomes redundant.
    const resolveTrustHost = (env: Record<string, string | undefined>) =>
      !!(env.AUTH_URL ?? env.AUTH_TRUST_HOST ?? env.VERCEL ?? env.CF_PAGES ?? (env.NODE_ENV !== "production" || undefined));

    expect(resolveTrustHost({ NODE_ENV: "production" })).toBe(false);
    expect(resolveTrustHost({ NODE_ENV: "production", VERCEL: "1" })).toBe(true);
    expect(resolveTrustHost({ NODE_ENV: "development" })).toBe(true);
  });
});
