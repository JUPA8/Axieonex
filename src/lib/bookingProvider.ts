import { prisma } from "@/lib/prisma";
import { pushToCrm } from "@/lib/crm";
import { sendNotificationEmail } from "@/lib/email";
import type { BookingData } from "@/types/booking";

export type BookingSubmission = BookingData & {
  slotId: string;
  slotLabel: string;
  calendarBookingUid: string;
  ipAddress: string;
};

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

/**
 * Server-side persistence boundary for the Book Strategy Call wizard.
 *
 * By the time this runs, the visitor has already scheduled a real time slot
 * directly in the embedded Calendly widget
 * (src/components/booking/CalendlyEmbed.tsx), which is the actual source of
 * truth for the booking: calendarBookingUid is the real Calendly event URI
 * it reported back via postMessage. This function only durably records that
 * outcome for our own CRM/notification purposes; it never attempts or
 * reverses the booking itself, so a failure here must never be presented to
 * the visitor as "your call isn't booked" (it is, on Calendly's side
 * regardless of what happens here).
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
        calendarBookingUid: payload.calendarBookingUid,
        status: "CONFIRMED",
        ipAddress: payload.ipAddress,
      },
    });
    requestId = request.id;
  } catch (error) {
    console.error("[bookingProvider] Failed to persist a Calendly-confirmed booking (the meeting is still real):", error);
    return { ok: false, reason: "not_configured" };
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
      `Confirmed slot: ${payload.slotLabel}`,
      `Calendly event: ${payload.calendarBookingUid}`,
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
    message: `Target market: ${payload.market}. Budget: ${payload.budget}. Confirmed slot: ${payload.slotLabel}.`,
    source: "book_strategy_call",
  });

  if (crmResult.ok) {
    await prisma.bookingRequest.update({ where: { id: requestId }, data: { crmSyncedAt: new Date() } }).catch(() => {});
  }

  return { ok: true };
}
