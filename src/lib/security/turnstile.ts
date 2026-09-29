import { fetchWithTimeout, ProviderTimeoutError } from "@/lib/security/providerRequest";

const VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { status: "verified" }
  | { status: "not_configured" }
  | { status: "failed"; reason: "misconfigured" | "missing_token" | "timeout" | "provider_error" | "rejected" };

/**
 * Verifies a Cloudflare Turnstile token server-side. If CAPTCHA_SECRET isn't
 * set yet (no Turnstile site configured), this returns "not_configured"
 * rather than blocking every submission, the caller decides how strict to
 * be in that case (Phase 1 logs a warning and lets the submission through,
 * since honeypot + rate limiting still apply).
 */
export async function verifyTurnstile(token: string | null | undefined, remoteIp?: string): Promise<TurnstileResult> {
  const secret = process.env.CAPTCHA_SECRET;
  const siteKey = process.env.CAPTCHA_SITE_KEY;
  if (!secret && !siteKey) return { status: "not_configured" };
  if (!secret || !siteKey) return { status: "failed", reason: "misconfigured" };

  if (!token) {
    return { status: "failed", reason: "missing_token" };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetchWithTimeout(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      return { status: "failed", reason: "provider_error" };
    }

    const data = (await response.json()) as unknown;
    if (typeof data !== "object" || data === null || !("success" in data) || typeof data.success !== "boolean") {
      return { status: "failed", reason: "provider_error" };
    }
    return data.success ? { status: "verified" } : { status: "failed", reason: "rejected" };
  } catch (error) {
    return { status: "failed", reason: error instanceof ProviderTimeoutError ? "timeout" : "provider_error" };
  }
}
