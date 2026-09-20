"use server";

import { submitBooking } from "@/lib/bookingProvider";
import { validateStep1, validateStep2, validateStep3, validateStep5 } from "@/lib/bookingValidation";
import { getClientIp } from "@/lib/security/getClientIp";
import { isHoneypotValueTripped } from "@/lib/security/honeypot";
import { checkRateLimit, warnIfRateLimitUnconfigured } from "@/lib/security/rateLimit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import type { BookingData } from "@/types/booking";

export type BookingGateResult = { status: "ok" | "spam" } | { status: "invalid" } | { status: "rate_limited" } | { status: "error" };

/**
 * Runs before the real Calendly scheduler is ever revealed to the visitor.
 * Unlike the contact form (where "pretend success" costs nothing), revealing
 * Calendly IS the sensitive action here: a bot that gets this far could spam
 * real slots on the business's real calendar. So a honeypot trip returns
 * "spam" rather than "ok", and the wizard shows the same success screen a
 * real visitor would see, without ever mounting the live embed.
 */
export async function verifyBookingGateAction(
  data: BookingData,
  honeypotValue: string,
  turnstileToken: string | null,
): Promise<BookingGateResult> {
  if (isHoneypotValueTripped(honeypotValue)) {
    return { status: "spam" };
  }

  const errors = {
    ...validateStep1(data),
    ...validateStep2(data),
    ...validateStep3(data),
    ...validateStep5(data),
  };
  if (Object.keys(errors).length > 0) {
    return { status: "invalid" };
  }

  const ipAddress = await getClientIp();

  warnIfRateLimitUnconfigured();
  const rateLimit = await checkRateLimit(`booking:${ipAddress}`);
  if (rateLimit.limited) {
    return { status: "rate_limited" };
  }

  const turnstile = await verifyTurnstile(turnstileToken, ipAddress);
  if (turnstile.status === "failed") {
    console.warn("[booking] Turnstile verification failed:", turnstile.reason);
    return { status: "error" };
  }

  return { status: "ok" };
}

export type BookingSubmitResult = { status: "success" } | { status: "unavailable" } | { status: "error" } | { status: "invalid" };

/**
 * Called only after Calendly itself has already confirmed the booking
 * (calendarBookingUid is the real event URI it reported back). This just
 * durably records that outcome; see src/lib/bookingProvider.ts for why a
 * failure here is never shown to the visitor as "not booked".
 */
export async function submitBookingAction(
  data: BookingData,
  slotId: string,
  slotLabel: string,
  calendarBookingUid: string,
): Promise<BookingSubmitResult> {
  const errors = {
    ...validateStep1(data),
    ...validateStep2(data),
    ...validateStep3(data),
    ...validateStep5(data),
  };
  if (!slotId || !slotLabel || !calendarBookingUid || Object.keys(errors).length > 0) {
    return { status: "invalid" };
  }

  const ipAddress = await getClientIp();
  const result = await submitBooking({ ...data, slotId, slotLabel, calendarBookingUid, ipAddress });
  if (result.ok) return { status: "success" };
  if (result.reason === "not_configured") return { status: "unavailable" };
  return { status: "error" };
}
