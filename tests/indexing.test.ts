import { afterEach, describe, expect, it, vi } from "vitest";
import { isIndexingEnabled } from "@/lib/indexing";
import { buildSecurityHeaders } from "@/lib/securityHeaders";
import robots from "@/app/robots";

const robotsTag = (headers: { key: string; value: string }[]) =>
  headers.find(({ key }) => key === "X-Robots-Tag")?.value ?? null;

describe("provider-neutral indexing switch", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("stays off unless something explicitly turns it on", () => {
    // The whole point: a host that sets no VERCEL_ENV gets no indexing.
    expect(isIndexingEnabled({ switchValue: undefined, deploymentEnvironment: undefined })).toBe(false);
    expect(isIndexingEnabled({ switchValue: "", deploymentEnvironment: undefined })).toBe(false);
    expect(isIndexingEnabled({ switchValue: "maybe", deploymentEnvironment: undefined })).toBe(false);
    expect(isIndexingEnabled({ switchValue: "1", deploymentEnvironment: undefined })).toBe(false);
  });

  it("opts in only on an exact true, ignoring case and surrounding space", () => {
    expect(isIndexingEnabled({ switchValue: "true" })).toBe(true);
    expect(isIndexingEnabled({ switchValue: " TRUE " })).toBe(true);
    expect(isIndexingEnabled({ switchValue: "false" })).toBe(false);
  });

  it("lets the switch override the host's own signal in both directions", () => {
    expect(isIndexingEnabled({ switchValue: "false", deploymentEnvironment: "production" })).toBe(false);
    expect(isIndexingEnabled({ switchValue: "true", deploymentEnvironment: "preview" })).toBe(true);
  });

  it("preserves the established Vercel behaviour when the switch is absent", () => {
    expect(isIndexingEnabled({ switchValue: undefined, deploymentEnvironment: "preview" })).toBe(false);
    expect(isIndexingEnabled({ switchValue: undefined, deploymentEnvironment: "production" })).toBe(true);
  });
});

describe("X-Robots-Tag", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is emitted on a host that provides no deployment environment of its own", () => {
    expect(robotsTag(buildSecurityHeaders("production", "https://axieonex.netlify.app", undefined, undefined))).toBe(
      "noindex, nofollow",
    );
  });

  it("is still emitted on a Vercel preview", () => {
    expect(robotsTag(buildSecurityHeaders("production", "https://preview.example.test", "preview", undefined))).toBe(
      "noindex, nofollow",
    );
  });

  it("is absent on Vercel production, exactly as before", () => {
    expect(robotsTag(buildSecurityHeaders("production", "https://www.axieonex.com", "production", undefined))).toBeNull();
  });

  it("clears once the switch is explicitly enabled on any host", () => {
    expect(robotsTag(buildSecurityHeaders("production", "https://www.axieonex.com", undefined, "true"))).toBeNull();
  });

  it("does not weaken any other protection when indexing is blocked", () => {
    const headers = buildSecurityHeaders("production", "https://axieonex.netlify.app", undefined, undefined);
    const byKey = Object.fromEntries(headers.map(({ key, value }) => [key, value]));
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Strict-Transport-Security"]).toContain("max-age=");
    expect(byKey["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  });
});

describe("robots.txt", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("disallows everything and publishes no sitemap while indexing is off", () => {
    vi.stubEnv("SITE_INDEXING_ENABLED", "false");
    const value = robots();
    expect(value.rules).toEqual([{ userAgent: "*", disallow: "/" }]);
    expect(value.sitemap).toBeUndefined();
  });

  it("defaults to disallow when the switch is absent and no host signal exists", () => {
    vi.stubEnv("SITE_INDEXING_ENABLED", "");
    vi.stubEnv("VERCEL_ENV", "");
    expect(robots().rules).toEqual([{ userAgent: "*", disallow: "/" }]);
  });

  it("opens up with a canonical sitemap once indexing is enabled", () => {
    vi.stubEnv("SITE_INDEXING_ENABLED", "true");
    const value = robots();
    expect(value.rules).toEqual([{ userAgent: "*", allow: "/" }]);
    expect(value.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
