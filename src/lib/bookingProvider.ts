import { prisma } from "@/lib/prisma";
import { createCalcomBooking } from "@/lib/calendar/calcom";
import { pushToCrm } from "@/lib/crm";
import { sendNotificationEmail } from "@/lib/email";
import type { BookingData } from "@/types/booking";

export type BookingSubmission = BookingData & { slotId: string; slotLabel: string; ipAddress: string };

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

/**
 * Server-side persistence boundary for the Book Strategy Call wizard.
 *
 * Writes the request to Postgres first (status PENDING); that write is the
 * source of truth for "did this submission succeed," independent of
 * whether a calendar provider is configured or whether it's reachable.
 *
 * Phase 2: if CALENDAR_PROVIDER_API_KEY/CALENDAR_ID are configured (see
 * src/lib/calendar/calcom.ts), attempts a real Cal.com booking for the
 * selected slot (whose id, by that point, is a real ISO start time from
 * getCalcomAvailability, not the mock generator's date-only key) and
 * updates the row to CONFIRMED with the returned booking UID. If that call
 * fails, the row stays PENDING rather than being silently marked CONFIRMED
 * or CANCELLED, an admin can follow up manually. Unconfigured or mocked
 * requests also stay PENDING, matching Phase 1's behavior exactly.
 *
 * A best-effort Resend notification email follows the same never-lose-the-
 * submission pattern regardless of calendar outcome.
 */
export async function submitBooking(payload: BookingSubmission): Promise<SendResult> {
  let requestId: string;
  try {
    const request = await prisma.bookingRequest.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        company: payload.company,
        website: payload.website,
        country: payload.country,
        size: payload.size,
        approach: payload.approach,
        outcome: payload.outcome,
        market: payload.market,
        budget: payload.budget,
        slotId: payload.slotId,
        slotLabel: payload.slotLabel,
        ipAddress: payload.ipAddress,
      },
    });
    requestId = request.id;
  } catch (error) {
    console.error("[bookingProvider] Failed to persist booking request:", error);
    return { ok: false, reason: "not_configured" };
  }

  const calendarResult = await createCalcomBooking({
    slotStartIso: payload.slotId,
    name: payload.name,
    email: payload.email,
    notes: `Target market: ${payload.market}. Current approach: ${payload.approach}. Desired outcome: ${payload.outcome}.`,
  });

  if (calendarResult.ok) {
    await prisma.bookingRequest
      .update({ where: { id: requestId }, data: { status: "CONFIRMED", calendarBookingUid: calendarResult.bookingUid } })
      .catch((error) => console.error("[bookingProvider] Booked with Cal.com but failed to record the UID:", error));
  } else if (calendarResult.reason !== "not_configured") {
    // A real provider is configured but this specific request failed to
    // confirm; leave the row PENDING for manual follow-up rather than
    // guessing at CONFIRMED or CANCELLED.
    console.error("[bookingProvider] Cal.com booking failed, request left PENDING for manual follow-up:", calendarResult.reason);
  }

  const emailResult = await sendNotificationEmail({
    subject: `New strategy call request: ${payload.company}`,
    text: [
      `Name: ${payload.name} (${payload.role})`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone}`,
      `Company: ${payload.company}, ${payload.website}, ${payload.size} employees, ${payload.country}`,
      `Target market: ${payload.market}`,
      `Current approach: ${payload.approach}`,
      `Desired outcome: ${payload.outcome}`,
      `Engagement range: ${payload.budget}`,
      `Requested slot: ${payload.slotLabel}`,
      calendarResult.ok ? `Confirmed on Cal.com: ${calendarResult.bookingUid}` : "Not yet confirmed on a calendar.",
    ].join("\n"),
  });

  if (emailResult.sent) {
    await prisma.bookingRequest.update({ where: { id: requestId }, data: { emailSentAt: new Date() } }).catch(() => {});
  }

  const crmResult = await pushToCrm({
    name: payload.name,
    email: payload.email,
    company: payload.company,
    phone: payload.phone,
    message: `Target market: ${payload.market}. Budget: ${payload.budget}. Requested slot: ${payload.slotLabel}.`,
    source: "book_strategy_call",
  });

  if (crmResult.ok) {
    await prisma.bookingRequest.update({ where: { id: requestId }, data: { crmSyncedAt: new Date() } }).catch(() => {});
  }

  return { ok: true };
}
