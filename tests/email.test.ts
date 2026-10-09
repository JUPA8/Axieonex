import { afterEach, describe, expect, it, vi } from "vitest";
import { sendContactAcknowledgementEmail, sendNotificationEmail } from "@/lib/email";
import { contactAcknowledgementHtml, contactAcknowledgementText, describeEnquiry } from "@/lib/emailTemplates/contactAcknowledgement";
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
    expect(Object.keys(body).sort()).toEqual(["from", "html", "subject", "text", "to"]);
  });

  it("builds the body from a fixed template so a submitter cannot inject text", async () => {
    const fetchSpy = configured();
    // The only caller-supplied values are the address and the enquiry type,
    // and the form validates the latter against a fixed set before this runs.
    await sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "partnership" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain("Thank you for reaching out.");
    expect(body.text).toContain("your partnership enquiry");
    expect(body.html).toContain("partnership enquiry");
    expect(body.subject).toBe("We have received your enquiry | AXIEONEX");
  });

  it("states the same response time the contact form shows, not a different one", async () => {
    const fetchSpy = configured();
    await sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain("within one business day");
    expect(body.text).toContain("1 business day");
  });

  it("tells the recipient the address is unattended and where to write instead", async () => {
    const fetchSpy = configured();
    await sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.text).toContain("automated confirmation");
    expect(body.text).toContain("Replies to this email are not monitored.");
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

describe("contact acknowledgement template", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("phrases every enquiry type the form offers grammatically", () => {
    expect(describeEnquiry("general")).toBe("general enquiry");
    expect(describeEnquiry("service")).toBe("service enquiry");
    expect(describeEnquiry("partnership")).toBe("partnership enquiry");
    expect(describeEnquiry("media")).toBe("media enquiry");
    // "your existing-client enquiry" reads badly, so this one is reworded.
    expect(describeEnquiry("client")).toBe("enquiry as an existing client");
  });

  it("falls back to a neutral noun for an unrecognised type", () => {
    expect(describeEnquiry("something-else")).toBe("enquiry");
    expect(describeEnquiry("")).toBe("enquiry");
  });

  it("reads naturally in the sentence it is dropped into", () => {
    for (const purpose of ["general", "service", "partnership", "media", "client"]) {
      const sentence = `We've received your ${describeEnquiry(purpose)}.`;
      expect(sentence).not.toContain("your  ");
      expect(sentence).toMatch(/^We've received your [a-z][a-z -]+\.$/);
    }
  });

  it("builds an email, not a web page", () => {
    const html = contactAcknowledgementHtml("general");
    expect(html).toContain("<table");
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<canvas/i);
    expect(html).not.toMatch(/position:\s*(absolute|fixed)/i);
    expect(html).not.toMatch(/display:\s*flex/i);
    expect(html).not.toMatch(/<link[^>]+stylesheet/i);
  });

  it("uses absolute https images, never base64, since an inbox has no origin", () => {
    const html = contactAcknowledgementHtml("general");
    const sources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    expect(sources.length).toBeGreaterThan(0);
    for (const src of sources) {
      expect(src).toMatch(/^https:\/\//);
      expect(src).not.toMatch(/^data:/);
    }
  });

  it("keeps the wording as live text so a blocked-image inbox loses nothing", () => {
    const html = contactAcknowledgementHtml("service");
    for (const phrase of [
      "A small hello.",
      "A new possibility.",
      "Thank you for reaching out.",
      "service enquiry",
      "1 business day.",
      "Speak soon,",
      "Better connections.",
      "New possibilities.",
      "Technology meets conversation.",
    ]) {
      expect(html).toContain(phrase);
    }
    // Decorative images carry empty alt so screen readers and blocked-image
    // views are not littered with placeholder captions.
    for (const tag of html.match(/<img[^>]*>/g) ?? []) expect(tag).toContain('alt=""');
  });

  it("says one business day, which cannot be read as a calendar day", () => {
    const html = contactAcknowledgementHtml("general");
    expect(html).toContain("1 business day.");
    expect(html).toContain("A reply from the right team.");
    expect(html).not.toContain("calendar day");
    expect(contactAcknowledgementText("general")).toContain("1 business day");
  });

  it("stays well under the size at which Gmail clips a message", () => {
    // Gmail clips around 102KB and hides everything past the cut.
    expect(contactAcknowledgementHtml("general").length).toBeLessThan(60_000);
  });

  it("ships a plain-text alternative carrying the same substance", () => {
    const text = contactAcknowledgementText("partnership");
    expect(text).toContain("partnership enquiry");
    expect(text).toContain("Speak soon,");
    expect(text).toContain("Replies to this email are not monitored.");
    expect(text).not.toContain("<");
  });

  it("sends html and text together, not html alone", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "notifications@notify.example.com");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "ack-2" }) });
    vi.stubGlobal("fetch", fetchSpy);

    await sendContactAcknowledgementEmail({ to: "visitor@example.com", purpose: "general" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.html).toContain("A small hello.");
    expect(body.text).toContain("Speak soon,");
    expect(body.to).toEqual(["visitor@example.com"]);
  });

  it("still sends text only for the internal notification", async () => {
    vi.stubEnv("EMAIL_PROVIDER_API_KEY", "key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "notifications@notify.example.com");
    vi.stubEnv("EMAIL_NOTIFICATION_RECIPIENT", "team@example.com");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "n-1" }) });
    vi.stubGlobal("fetch", fetchSpy);

    await sendNotificationEmail({ subject: "New contact enquiry: general", text: "Body" });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body).not.toHaveProperty("html");
    expect(body.to).toEqual(["team@example.com"]);
  });
});
