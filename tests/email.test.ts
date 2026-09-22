import { afterEach, describe, expect, it, vi } from "vitest";
import { sendNotificationEmail } from "@/lib/email";
import { ProviderTimeoutError } from "@/lib/security/providerRequest";

describe("sendNotificationEmail", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("requires the API key and sender as a complete pair", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "");
    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: false, reason: "misconfigured" });
  });

  it("does not make a request when fully unconfigured", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("handles success, non-2xx, and rejected requests without throwing", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "sender@example.com");
    const fetchSpy = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ id: "email-1" }) }).mockResolvedValueOnce({ ok: false, status: 500 }).mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetchSpy);
    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: true });
    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: false, reason: "provider_error" });
    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: false, reason: "provider_error" });
  });

  it("rejects malformed success responses and reports timeouts", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "sender@example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({}) }).mockRejectedValueOnce(new ProviderTimeoutError()));
    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: false, reason: "provider_error" });
    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: false, reason: "timeout" });
  });
});
