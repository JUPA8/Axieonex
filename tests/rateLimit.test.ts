import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("checkRateLimit (unconfigured)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns an explicit unavailable result when Upstash isn't configured", async () => {
    const { checkConsentRateLimit, checkRateLimit } = await import("@/lib/security/rateLimit");
    const result = await checkRateLimit("test-key");
    expect(result).toEqual({ status: "unavailable", reason: "not_configured" });
    await expect(checkConsentRateLimit("test-ip")).resolves.toEqual({ status: "unavailable", reason: "not_configured" });
  });

  it("rejects a half-configured URL/token pair", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.resetModules();
    const { checkRateLimit } = await import("@/lib/security/rateLimit");
    await expect(checkRateLimit("test-key")).resolves.toEqual({ status: "unavailable", reason: "misconfigured" });
  });

  it("fails closed for partial or unavailable providers in every environment", async () => {
    const { shouldFailClosedForAntiAbuse } = await import("@/lib/security/rateLimit");
    expect(shouldFailClosedForAntiAbuse("misconfigured")).toBe(true);
    expect(shouldFailClosedForAntiAbuse("timeout")).toBe(true);
    expect(shouldFailClosedForAntiAbuse("provider_error")).toBe(true);
    expect(shouldFailClosedForAntiAbuse("not_configured")).toBe(false);
  });

  it.each(["preview", "production"])("fails closed when an unconfigured limiter is deployed to Vercel %s", async (environment) => {
    vi.stubEnv("VERCEL_ENV", environment);
    const { shouldFailClosedForAntiAbuse } = await import("@/lib/security/rateLimit");
    expect(shouldFailClosedForAntiAbuse("not_configured")).toBe(true);
  });

  it("warns exactly once regardless of how many times it's called", async () => {
    const { warnIfRateLimitUnconfigured } = await import("@/lib/security/rateLimit");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnIfRateLimitUnconfigured();
    warnIfRateLimitUnconfigured();
    warnIfRateLimitUnconfigured();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
