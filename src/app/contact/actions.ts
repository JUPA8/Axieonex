"use server";

import { sendContactForm } from "@/lib/contactProvider";
import { getClientIp } from "@/lib/security/getClientIp";
import { isHoneypotTripped } from "@/lib/security/honeypot";
import { checkRateLimit, shouldFailClosedForAntiAbuse, warnIfRateLimitUnconfigured } from "@/lib/security/rateLimit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { parseContactForm } from "@/lib/serverValidation";

export type ContactFormState = {
  status: "idle" | "success" | "unavailable" | "error" | "rate_limited";
  errors: Partial<Record<"purpose" | "name" | "email" | "message" | "consent", string>>;
};

export async function submitContactAction(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Spam caught here is never reported as an error: the honeypot is
  // pointless if bots can learn their submission was rejected.
  if (isHoneypotTripped(formData)) {
    return { status: "success", errors: {} };
  }

  const parsed = parseContactForm(formData);
  if (!parsed.ok) return { status: "idle", errors: parsed.errors };
  const { purpose, name, email, company, message } = parsed.data;

  const ipAddress = await getClientIp();

  warnIfRateLimitUnconfigured();
  const rateLimit = await checkRateLimit(`contact:${ipAddress}`);
  if (rateLimit.status === "limited") {
    return { status: "rate_limited", errors: {} };
  }
  if (rateLimit.status === "unavailable" && shouldFailClosedForAntiAbuse(rateLimit.reason)) return { status: "error", errors: {} };

  const turnstileToken = formData.get("cf-turnstile-response");
  const turnstile = await verifyTurnstile(typeof turnstileToken === "string" ? turnstileToken : null, ipAddress);
  if (turnstile.status === "failed") {
    console.warn("[contact] Turnstile verification failed:", turnstile.reason);
    return { status: "error", errors: {} };
  }
  if (turnstile.status === "not_configured" && shouldFailClosedForAntiAbuse()) return { status: "error", errors: {} };

  const result = await sendContactForm({ purpose, name, email, company, message, ipAddress });

  if (result.ok) return { status: "success", errors: {} };
  if (result.reason === "not_configured") return { status: "unavailable", errors: {} };
  return { status: "error", errors: {} };
}
