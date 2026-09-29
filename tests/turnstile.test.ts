import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "@/lib/security/turnstile";

describe("verifyTurnstile", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports not_configured when CAPTCHA_SECRET is unset, without making a network call", async () => {
    vi.stubEnv("CAPTCHA_SECRET", "");
    vi.stubEnv("CAPTCHA_SITE_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await verifyTurnstile("some-token");
    expect(result.status).toBe("not_configured");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fails when configured but no token was provided", async () => {
    vi.stubEnv("CAPTCHA_SECRET", "test-secret");
    vi.stubEnv("CAPTCHA_SITE_KEY", "test-site-key");
    const result = await verifyTurnstile(null);
    expect(result).toEqual({ status: "failed", reason: "missing_token" });
  });

  it("verifies a token against Cloudflare's siteverify endpoint", async () => {
    vi.stubEnv("CAPTCHA_SECRET", "test-secret");
    vi.stubEnv("CAPTCHA_SITE_KEY", "test-site-key");
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await verifyTurnstile("real-token", "1.2.3.4");
    expect(result.status).toBe("verified");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("reports the rejection reason when Cloudflare rejects the token", async () => {
    vi.stubEnv("CAPTCHA_SECRET", "test-secret");
    vi.stubEnv("CAPTCHA_SITE_KEY", "test-site-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
      }),
    );

    const result = await verifyTurnstile("bad-token");
    expect(result).toEqual({ status: "failed", reason: "rejected" });
  });

  it("fails closed if the verification request itself errors", async () => {
    vi.stubEnv("CAPTCHA_SECRET", "test-secret");
    vi.stubEnv("CAPTCHA_SITE_KEY", "test-site-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await verifyTurnstile("some-token");
    expect(result).toEqual({ status: "failed", reason: "provider_error" });
  });

  it("rejects a half-configured site key/secret pair", async () => {
    vi.stubEnv("CAPTCHA_SECRET", "test-secret");
    vi.stubEnv("CAPTCHA_SITE_KEY", "");
    await expect(verifyTurnstile("token")).resolves.toEqual({ status: "failed", reason: "misconfigured" });
  });

  it("rejects malformed and non-2xx provider responses", async () => {
    vi.stubEnv("CAPTCHA_SECRET", "test-secret");
    vi.stubEnv("CAPTCHA_SITE_KEY", "test-site-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ nope: true }) }).mockResolvedValueOnce({ ok: false, status: 500 }));
    await expect(verifyTurnstile("token")).resolves.toEqual({ status: "failed", reason: "provider_error" });
    await expect(verifyTurnstile("token")).resolves.toEqual({ status: "failed", reason: "provider_error" });
  });
});
