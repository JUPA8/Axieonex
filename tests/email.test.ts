import { afterEach, describe, expect, it, vi } from "vitest";
import { sendContactAcknowledgementEmail, sendNotificationEmail } from "@/lib/email";
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

  it("uses the public contact address when no notification recipient override is configured", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "sender@example.com");
    vi.stubEnv("EMAIL_NOTIFICATION_RECIPIENT", "");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "email-1" }) });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: true });

    expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toMatchObject({
      to: ["info@axieonexsales.net"],
    });
  });

  it("uses a valid server-side notification recipient override", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "onboarding@resend.dev");
    vi.stubEnv("EMAIL_NOTIFICATION_RECIPIENT", " owner@example.com ");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "email-1" }) });
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({ sent: true });

    expect(JSON.parse(fetchSpy.mock.calls[0][1].body)).toMatchObject({
      from: "onboarding@resend.dev",
      to: ["owner@example.com"],
    });
  });

  it("rejects an invalid notification recipient override without calling Resend", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "sender@example.com");
    vi.stubEnv("EMAIL_NOTIFICATION_RECIPIENT", "first@example.com,second@example.com");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(sendNotificationEmail({ subject: "Test", text: "Body" })).resolves.toEqual({
      sent: false,
      reason: "misconfigured",
    });
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

describe("sendContactAcknowledgementEmail", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  const configured = () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "notifications@notify.example.com");
    vi.stubEnv("EMAIL_NOTIFICATION_RECIPIENT", "team@example.com");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "ack-1" }) });
    vi.stubGlobal("fetch", fetchSpy);
    return fetchSpy;
  };

  it("sends to the submitter, never to the internal recipient", async () => {
    const fetchSpy = configured();
    await expect(
      sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" }),
    ).resolves.toEqual({ sent: true });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.to).toEqual(["visitor@example.com"]);
    expect(body.to).toHaveLength(1);
    expect(JSON.stringify(body)).not.toContain("team@example.com");
  });

  it("has no cc or bcc, so no third party can be added to the send", async () => {
    const fetchSpy = configured();
    await sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body).not.toHaveProperty("cc");
    expect(body).not.toHaveProperty("bcc");
    expect(Object.keys(body).sort()).toEqual(["from", "subject", "text", "to"]);
  });

  it("builds the body from a fixed template so a submitter cannot inject text", async () => {
    const fetchSpy = configured();
    // The only caller-supplied values are the address and the enquiry type,
    // and the form validates the latter against a fixed set before this runs.
    await sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "partnership" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain("Thank you for contacting AXIEONEX.");
    expect(body.text).toContain("your partnership enquiry");
    expect(body.subject).toBe("We have received your enquiry | AXIEONEX");
  });

  it("states the same response time the contact form shows, not a different one", async () => {
    const fetchSpy = configured();
    await sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain("We route enquiries to the right team and reply within one business day.");
  });

  it("tells the recipient the address is unattended and where to write instead", async () => {
    const fetchSpy = configured();
    await sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain("automated acknowledgement");
    expect(body.text).toContain("info@axieonexsales.net");
  });

  it("rejects a malformed submitter address without contacting Resend", async () => {
    const fetchSpy = configured();
    for (const bad of ["not-an-email", "a@b", "", "two@addresses.com, other@x.com"]) {
      await expect(
        sendContactAcknowledgementEmail({ to: bad, purpose: "general" }),
      ).resolves.toEqual({ sent: false, reason: "misconfigured" });
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("stays silent and unconfigured when no provider is set up", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(
      sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" }),
    ).resolves.toEqual({ sent: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports a provider failure rather than throwing", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "notifications@notify.example.com");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new ProviderTimeoutError()));
    await expect(
      sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" }),
    ).resolves.toEqual({ sent: false, reason: "timeout" });
  });
});
