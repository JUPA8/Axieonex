import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_TOLERANCE_SECONDS = 180;
const CORRELATION_PATTERN = /^axieonex_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getCalendlyWebhookConfig(): { signingKey: string; userUri: string } | null {
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY?.trim();
  const userUri = process.env.CALENDLY_WEBHOOK_USER_URI?.trim();
  return signingKey && userUri ? { signingKey, userUri } : null;
}

export function verifyCalendlySignature(
  rawBody: string,
  signatureHeader: string | null,
  signingKey: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (!signatureHeader) return false;
  const fields = signatureHeader.split(",").map((field) => field.trim());
  const timestampText = fields.find((field) => field.startsWith("t="))?.slice(2);
  const signatures = fields.filter((field) => field.startsWith("v1=")).map((field) => field.slice(3));
  if (!timestampText || !/^\d+$/.test(timestampText) || signatures.length === 0) return false;
  const timestamp = Number(timestampText);
  if (!Number.isSafeInteger(timestamp) || Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac("sha256", signingKey).update(`${timestamp}.${rawBody}`).digest();
  return signatures.some((signature) => {
    if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
    const supplied = Buffer.from(signature, "hex");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  });
}

type CalendlyWebhookPayload = {
  event?: unknown;
  created_by?: unknown;
  payload?: {
    uri?: unknown;
    event?: unknown;
    email?: unknown;
    tracking?: { utm_content?: unknown } | null;
    scheduled_event?: { start_time?: unknown } | null;
  };
};

export type VerifiedCalendlyBooking = {
  correlationId: string;
  eventUri: string;
  inviteeUri: string;
  inviteeEmail: string;
  startTime?: string;
};

function parseCalendlyUri(value: unknown, pattern: RegExp): URL | null {
  if (typeof value !== "string" || !pattern.test(value)) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "api.calendly.com" ? url : null;
  } catch {
    return null;
  }
}

export function parseCalendlyBookingPayload(
  value: unknown,
  expectedUserUri: string,
): { ok: true; booking: VerifiedCalendlyBooking } | { ok: false; reason: "malformed" | "wrong_account" | "ignored_event" } {
  if (typeof value !== "object" || value === null) return { ok: false, reason: "malformed" };
  const body = value as CalendlyWebhookPayload;
  if (body.event !== "invitee.created") return { ok: false, reason: "ignored_event" };
  if (body.created_by !== expectedUserUri) return { ok: false, reason: "wrong_account" };

  const payload = body.payload;
  const eventUrl = parseCalendlyUri(payload?.event, /^https:\/\/api\.calendly\.com\/scheduled_events\/[^/]+$/);
  const inviteeUrl = parseCalendlyUri(payload?.uri, /^https:\/\/api\.calendly\.com\/scheduled_events\/([^/]+)\/invitees\/[^/]+$/);
  const correlationId = payload?.tracking?.utm_content;
  const inviteeEmail = payload?.email;
  if (!eventUrl || !inviteeUrl || eventUrl.pathname !== inviteeUrl.pathname.split("/invitees/")[0]) {
    return { ok: false, reason: "malformed" };
  }
  if (typeof correlationId !== "string" || !CORRELATION_PATTERN.test(correlationId)) return { ok: false, reason: "malformed" };
  if (typeof inviteeEmail !== "string" || !inviteeEmail.trim() || inviteeEmail.length > 320) return { ok: false, reason: "malformed" };
  const startTime = payload?.scheduled_event?.start_time;
  if (startTime !== undefined && (typeof startTime !== "string" || Number.isNaN(Date.parse(startTime)))) {
    return { ok: false, reason: "malformed" };
  }
  return {
    ok: true,
    booking: {
      correlationId,
      eventUri: eventUrl.toString(),
      inviteeUri: inviteeUrl.toString(),
      inviteeEmail,
      ...(typeof startTime === "string" ? { startTime } : {}),
    },
  };
}
