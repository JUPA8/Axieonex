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

describe("checkRateLimit (present but unusable configuration)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  // Both variables are set, so the earlier not_configured and misconfigured
  // guards pass and the Upstash client constructor is actually reached. It
  // validates the URL and throws, which used to escape this module and crash
  // the request with a bare 500 instead of the generic fail-closed response.
  const unusableUrls: [string, string][] = [
    ["the REST token pasted into the URL field", "gQAAAAAAAnExampleTokenShapedValue"],
    ["a redis:// TCP URI instead of the REST endpoint", "redis://default:secret@example.upstash.io:6379"],
    ["a host with no scheme", "example.upstash.io"],
    ["an outright malformed value", "https://"],
  ];

  it.each(unusableUrls)("reports %s as unavailable rather than throwing", async (_label, url) => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", url);
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "example-token");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { checkRateLimit, checkConsentRateLimit } = await import("@/lib/security/rateLimit");

    await expect(checkRateLimit("1.2.3.4")).resolves.toEqual({ status: "unavailable", reason: "misconfigured" });
    await expect(checkConsentRateLimit("1.2.3.4")).resolves.toEqual({ status: "unavailable", reason: "misconfigured" });
  });

  it("drives the caller to the generic fail-closed response, not a crash", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "gQAAAAAAAnExampleTokenShapedValue");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "example-token");
    vi.stubEnv("NODE_ENV", "production");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { checkRateLimit, shouldFailClosedForAntiAbuse } = await import("@/lib/security/rateLimit");

    const result = await checkRateLimit("1.2.3.4");
    expect(result.status).toBe("unavailable");
    // "misconfigured" fails closed in every environment, so the route returns
    // its 503 rather than letting the submission through.
    expect(shouldFailClosedForAntiAbuse(result.status === "unavailable" ? result.reason : undefined)).toBe(true);
  });

  it("never puts the offending value in the log, since a swap makes it a credential", async () => {
    const secretish = "gQAAAAAAAnExampleTokenShapedValue";
    vi.stubEnv("UPSTASH_REDIS_REST_URL", secretish);
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "example-token");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { checkRateLimit } = await import("@/lib/security/rateLimit");

    await checkRateLimit("1.2.3.4");
    expect(errorSpy).toHaveBeenCalled();
    for (const call of errorSpy.mock.calls) {
      expect(call.map(String).join(" ")).not.toContain(secretish);
    }
  });

  it("caches the failure instead of re-constructing a client it knows is broken", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "gQAAAAAAAnExampleTokenShapedValue");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "example-token");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { checkRateLimit } = await import("@/lib/security/rateLimit");

    await checkRateLimit("1.2.3.4");
    await checkRateLimit("5.6.7.8");
    await checkRateLimit("9.10.11.12");
    // One namespace, one construction attempt, one log line.
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
