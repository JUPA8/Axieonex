import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { parseCalendlyBookingPayload, verifyCalendlySignature } from "@/lib/calendlyWebhook";

const NOW = 1_800_000_000;
const BODY = '{"event":"invitee.created"}';
const KEY = "test-signing-key";

function signature(timestamp = NOW, body = BODY) {
  return `t=${timestamp},v1=${createHmac("sha256", KEY).update(`${timestamp}.${body}`).digest("hex")}`;
}

describe("Calendly webhook verification", () => {
  it("accepts a valid signature", () => expect(verifyCalendlySignature(BODY, signature(), KEY, NOW)).toBe(true));
  it("rejects missing and invalid signatures", () => {
    expect(verifyCalendlySignature(BODY, null, KEY, NOW)).toBe(false);
    expect(verifyCalendlySignature(BODY, `t=${NOW},v1=${"0".repeat(64)}`, KEY, NOW)).toBe(false);
  });
  it("rejects stale and future signatures", () => {
    expect(verifyCalendlySignature(BODY, signature(NOW - 181), KEY, NOW)).toBe(false);
    expect(verifyCalendlySignature(BODY, signature(NOW + 181), KEY, NOW)).toBe(false);
  });

  it("accepts a correlated invitee from the configured account", () => {
    const payload = {
      event: "invitee.created",
      created_by: "https://api.calendly.com/users/user-1",
      payload: {
        event: "https://api.calendly.com/scheduled_events/event-1",
        uri: "https://api.calendly.com/scheduled_events/event-1/invitees/invitee-1",
        email: "jane@example.com",
        tracking: { utm_content: "axieonex_123e4567-e89b-42d3-a456-426614174000" },
        scheduled_event: { start_time: "2026-10-01T09:00:00Z" },
      },
    };
    const parsed = parseCalendlyBookingPayload(payload, payload.created_by);
    expect(parsed).toEqual(expect.objectContaining({ ok: true }));
  });

  it("rejects another Calendly account and mismatched event/invitee URIs", () => {
    const base = {
      event: "invitee.created", created_by: "attacker",
      payload: { event: "https://api.calendly.com/scheduled_events/a", uri: "https://api.calendly.com/scheduled_events/b/invitees/c", email: "a@b.com", tracking: { utm_content: "axieonex_123e4567-e89b-42d3-a456-426614174000" } },
    };
    expect(parseCalendlyBookingPayload(base, "expected")).toEqual({ ok: false, reason: "wrong_account" });
    expect(parseCalendlyBookingPayload({ ...base, created_by: "expected" }, "expected")).toEqual({ ok: false, reason: "malformed" });
  });
});
