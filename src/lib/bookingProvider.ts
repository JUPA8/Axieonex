import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";
import type { BookingData } from "@/types/booking";

export type BookingSubmission = BookingData & { slotId: string; slotLabel: string; ipAddress: string };

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

/**
 * Server-side persistence boundary for the Book Strategy Call wizard.
 *
 * Phase 1: writes the request to Postgres first (status PENDING); that
 * write is the source of truth for "did this submission succeed." No live
 * calendar exists yet (see BookingWizard's mocked 4-weekday availability),
 * so nothing is actually confirmed against a real calendar here; Phase 2
 * replaces this with a real provider and updates `status` accordingly. A
 * best-effort Resend notification email follows the same never-lose-the-
 * submission pattern as the contact form.
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
    ].join("\n"),
  });

  if (emailResult.sent) {
    await prisma.bookingRequest.update({ where: { id: requestId }, data: { emailSentAt: new Date() } }).catch(() => {});
  }

  return { ok: true };
}
