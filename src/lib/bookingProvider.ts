import type { BookingData } from "@/types/booking";

export type BookingSubmission = BookingData & { slotLabel: string };

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

/**
 * Server-side booking submission boundary. No calendar provider has been
 * selected yet (see axieonex-integrations.json, "Strategy Call booking and
 * calendar", status: mocked pending calendar provider selection). Until
 * CALENDAR_PROVIDER_API_KEY and CALENDAR_ID are configured, this honestly
 * reports "not_configured" instead of confirming a booking that was never
 * created. Also responsible for server-side slot re-validation once a real
 * calendar is wired up, to prevent double-booking.
 */
export async function submitBooking(payload: BookingSubmission): Promise<SendResult> {
  const apiKey = process.env.CALENDAR_PROVIDER_API_KEY;
  const calendarId = process.env.CALENDAR_ID;
  if (!apiKey || !calendarId) {
    return { ok: false, reason: "not_configured" };
  }

  // No calendar provider is integrated yet; this branch is unreachable until
  // one is selected and implemented against its real API.
  console.error("submitBooking: no calendar provider integration implemented", { email: payload.email });
  return { ok: false, reason: "send_failed" };
}
