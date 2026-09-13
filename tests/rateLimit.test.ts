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

  it("never limits when Upstash isn't configured", async () => {
    const { checkRateLimit } = await import("@/lib/security/rateLimit");
    const result = await checkRateLimit("test-key");
    expect(result).toEqual({ limited: false });
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
