"use server";

import { createPendingBooking, getBookingStatus } from "@/lib/bookingProvider";
import { getCalendlyWebhookConfig } from "@/lib/calendlyWebhook";
import { getClientIp } from "@/lib/security/getClientIp";
import { isHoneypotValueTripped } from "@/lib/security/honeypot";
import { checkRateLimit, shouldFailClosedForAntiAbuse, warnIfRateLimitUnconfigured } from "@/lib/security/rateLimit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import type { BookingData } from "@/types/booking";
import { parseBookingData } from "@/lib/serverValidation";

export type BookingGateResult =
  | { status: "ok"; correlationId: string }
  | { status: "spam" | "invalid" | "rate_limited" | "error" | "unavailable" };

export async function verifyBookingGateAction(
  data: BookingData,
  honeypotValue: string,
  turnstileToken: string | null,
): Promise<BookingGateResult> {
  if (isHoneypotValueTripped(honeypotValue)) return { status: "spam" };
  if (!process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || !getCalendlyWebhookConfig()) return { status: "unavailable" };

  const parsed = parseBookingData(data);
  if (!parsed.ok) return { status: "invalid" };

  const ipAddress = await getClientIp();
  warnIfRateLimitUnconfigured();
  const rateLimit = await checkRateLimit(`booking:${ipAddress}`);
  if (rateLimit.status === "limited") return { status: "rate_limited" };
  if (rateLimit.status === "unavailable" && shouldFailClosedForAntiAbuse(rateLimit.reason)) return { status: "error" };

  const turnstile = await verifyTurnstile(turnstileToken, ipAddress);
  if (turnstile.status === "failed") {
    console.warn("[booking] Turnstile verification failed:", turnstile.reason);
    return { status: "error" };
  }
  if (turnstile.status === "not_configured" && shouldFailClosedForAntiAbuse()) return { status: "error" };

  const pending = await createPendingBooking({ ...parsed.data, ipAddress });
  return pending.ok ? { status: "ok", correlationId: pending.correlationId } : { status: "unavailable" };
}

export type BookingStatusResult = { status: "pending" | "confirmed" | "unavailable" | "error" };

export async function getBookingStatusAction(correlationId: string): Promise<BookingStatusResult> {
  if (!/^axieonex_[0-9a-f-]{36}$/i.test(correlationId)) return { status: "error" };
  if (!getCalendlyWebhookConfig()) return { status: "unavailable" };
  try {
    const status = await getBookingStatus(correlationId);
    return { status: status === "confirmed" ? "confirmed" : "pending" };
  } catch {
    return { status: "unavailable" };
  }
}
