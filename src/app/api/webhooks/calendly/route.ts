import { confirmPendingBooking } from "@/lib/bookingProvider";
import { getCalendlyWebhookConfig, parseCalendlyBookingPayload, verifyCalendlySignature } from "@/lib/calendlyWebhook";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 256 * 1024;

export async function POST(request: Request): Promise<Response> {
  const config = getCalendlyWebhookConfig();
  if (!config) return Response.json({ error: "Webhook unavailable" }, { status: 503 });

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) return Response.json({ error: "Invalid request" }, { status: 413 });
  if (!verifyCalendlySignature(rawBody, request.headers.get("calendly-webhook-signature"), config.signingKey)) {
    return Response.json({ error: "Invalid request" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = parseCalendlyBookingPayload(body, config.userUri);
  if (!parsed.ok) {
    if (parsed.reason === "ignored_event") return Response.json({ received: true });
    return Response.json({ error: "Invalid request" }, { status: parsed.reason === "wrong_account" ? 403 : 400 });
  }

  try {
    const result = await confirmPendingBooking(parsed.booking);
    return Response.json({ received: true, result });
  } catch (error) {
    console.error("[calendly-webhook] Booking confirmation failed:", error);
    return Response.json({ error: "Temporarily unavailable" }, { status: 503 });
  }
}
