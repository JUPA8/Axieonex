import "server-only";

import { randomUUID } from "node:crypto";
import { pushToCrm } from "@/lib/crm";
import { sendNotificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import type { BookingData } from "@/types/booking";

export type PendingBookingResult =
  | { ok: true; correlationId: string }
  | { ok: false; reason: "not_configured" };

export async function createPendingBooking(data: BookingData & { ipAddress: string }): Promise<PendingBookingResult> {
  const correlationId = `axieonex_${randomUUID()}`;
  const { consent: _consent, ipAddress, ...bookingData } = data;
  void _consent;
  try {
    await prisma.bookingRequest.create({
      data: {
        ...bookingData,
        email: data.email.trim().toLowerCase(),
        slotId: "pending-calendly-webhook",
        slotLabel: "Pending Calendly confirmation",
        calendarCorrelationId: correlationId,
        status: "PENDING",
        ipAddress,
      },
    });
    return { ok: true, correlationId };
  } catch (error) {
    console.error("[bookingProvider] Failed to persist pending booking:", error);
    return { ok: false, reason: "not_configured" };
  }
}

export async function getBookingStatus(correlationId: string): Promise<"pending" | "confirmed" | "not_found"> {
  const booking = await prisma.bookingRequest.findUnique({
    where: { calendarCorrelationId: correlationId },
    select: { status: true },
  });
  if (!booking) return "not_found";
  return booking.status === "CONFIRMED" ? "confirmed" : "pending";
}

export type ConfirmBookingInput = {
  correlationId: string;
  eventUri: string;
  inviteeUri: string;
  inviteeEmail: string;
  startTime?: string;
};

export type ConfirmBookingResult = "confirmed" | "duplicate" | "not_found" | "conflict";

export async function confirmPendingBooking(input: ConfirmBookingInput): Promise<ConfirmBookingResult> {
  const booking = await prisma.bookingRequest.findUnique({ where: { calendarCorrelationId: input.correlationId } });
  if (!booking) return "not_found";
  if (booking.calendarInviteeUid === input.inviteeUri && booking.status === "CONFIRMED") return "duplicate";
  if (booking.email.trim().toLowerCase() !== input.inviteeEmail.trim().toLowerCase()) return "conflict";

  let updated;
  try {
    updated = await prisma.bookingRequest.updateMany({
      where: { id: booking.id, status: "PENDING", calendarInviteeUid: null },
      data: {
        status: "CONFIRMED",
        calendarBookingUid: input.eventUri,
        calendarInviteeUid: input.inviteeUri,
        confirmedAt: new Date(),
        ...(input.startTime
          ? { slotId: input.startTime, slotLabel: input.startTime }
          : {}),
      },
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return "duplicate";
    throw error;
  }

  if (updated.count === 0) {
    const current = await prisma.bookingRequest.findUnique({ where: { id: booking.id } });
    return current?.calendarInviteeUid === input.inviteeUri && current.status === "CONFIRMED" ? "duplicate" : "conflict";
  }

  const emailResult = await sendNotificationEmail({
    subject: `New strategy call request: ${booking.company}`,
    text: [
      `Name: ${booking.name} (${booking.role})`,
      `Email: ${booking.email}`,
      `Phone: ${booking.phone}`,
      `Company: ${booking.company}, ${booking.website}, ${booking.size} employees, ${booking.country}`,
      `Target market: ${booking.market}`,
      `Current approach: ${booking.approach}`,
      `Desired outcome: ${booking.outcome}`,
      `Engagement range: ${booking.budget}`,
      `Confirmed slot: ${input.startTime ?? "See Calendly"}`,
      `Calendly event: ${input.eventUri}`,
    ].join("\n"),
  });
  if (emailResult.sent) {
    await prisma.bookingRequest.update({ where: { id: booking.id }, data: { emailSentAt: new Date() } }).catch(() => {});
  }

  const crmResult = await pushToCrm({
    name: booking.name,
    email: booking.email,
    company: booking.company,
    phone: booking.phone,
    message: `Target market: ${booking.market}. Budget: ${booking.budget}. Confirmed slot: ${input.startTime ?? "See Calendly"}.`,
    source: "book_strategy_call",
  });
  if (crmResult.ok) {
    await prisma.bookingRequest.update({ where: { id: booking.id }, data: { crmSyncedAt: new Date() } }).catch(() => {});
  }
  return "confirmed";
}
