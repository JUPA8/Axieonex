import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSecurityHeaders, CONTENT_SECURITY_POLICY, SECURITY_HEADERS } from "@/lib/securityHeaders";
import { nextConfig } from "../next.config";

describe("security headers", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sets the required global protections and integration-scoped CSP", () => {
    const headers = Object.fromEntries(SECURITY_HEADERS.map(({ key, value }) => [key, value]));
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("https://assets.calendly.com");
    expect(CONTENT_SECURITY_POLICY).toContain("https://challenges.cloudflare.com");
    expect(CONTENT_SECURITY_POLICY).toContain("https://plausible.io");
    expect(CONTENT_SECURITY_POLICY).not.toContain("default-src *");
  });

  it("attaches the header set to every application response", async () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    const configured = await (nextConfig.headers as () => Promise<Array<{ source: string; headers: typeof SECURITY_HEADERS }>>)();
    expect(configured).toEqual([{ source: "/:path*", headers: SECURITY_HEADERS }]);
  });

  it("does not emit HSTS outside a production HTTPS configuration", () => {
    expect(SECURITY_HEADERS.some(({ key }) => key === "Strict-Transport-Security")).toBe(false);
    expect(buildSecurityHeaders("production", "https://www.axieonex.com").some(({ key }) => key === "Strict-Transport-Security")).toBe(true);
    expect(buildSecurityHeaders("production", "http://localhost:3000").some(({ key }) => key === "Strict-Transport-Security")).toBe(false);
  });
});
