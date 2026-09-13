"use server";

import { submitBooking } from "@/lib/bookingProvider";
import { validateStep1, validateStep2, validateStep3, validateStep5 } from "@/lib/bookingValidation";
import { getClientIp } from "@/lib/security/getClientIp";
import { isHoneypotValueTripped } from "@/lib/security/honeypot";
import { checkRateLimit, warnIfRateLimitUnconfigured } from "@/lib/security/rateLimit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import type { BookingData } from "@/types/booking";

export type BookingSubmitResult =
  | { status: "success" }
  | { status: "unavailable" }
  | { status: "error" }
  | { status: "invalid" }
  | { status: "rate_limited" };

export async function submitBookingAction(
  data: BookingData,
  slotId: string,
  slotLabel: string,
  honeypotValue: string,
  turnstileToken: string | null,
): Promise<BookingSubmitResult> {
  // Spam caught here is reported as a normal success: the honeypot is
  // pointless if bots can learn their submission was rejected.
  if (isHoneypotValueTripped(honeypotValue)) {
    return { status: "success" };
  }

  const errors = {
    ...validateStep1(data),
    ...validateStep2(data),
    ...validateStep3(data),
    ...validateStep5(data),
  };
  if (!slotId || !slotLabel || Object.keys(errors).length > 0) {
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

  const result = await submitBooking({ ...data, slotId, slotLabel, ipAddress });
  if (result.ok) return { status: "success" };
  if (result.reason === "not_configured") return { status: "unavailable" };
  return { status: "error" };
}
