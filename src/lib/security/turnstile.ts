const VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { status: "verified" }
  | { status: "not_configured" }
  | { status: "failed"; reason: string };

/**
 * Verifies a Cloudflare Turnstile token server-side. If CAPTCHA_SECRET isn't
 * set yet (no Turnstile site configured), this returns "not_configured"
 * rather than blocking every submission — the caller decides how strict to
 * be in that case (Phase 1 logs a warning and lets the submission through,
 * since honeypot + rate limiting still apply).
 */
export async function verifyTurnstile(token: string | null | undefined, remoteIp?: string): Promise<TurnstileResult> {
  const secret = process.env.CAPTCHA_SECRET;
  if (!secret) {
    return { status: "not_configured" };
  }

  if (!token) {
    return { status: "failed", reason: "missing_token" };
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      return { status: "failed", reason: `http_${response.status}` };
    }

    const data = (await response.json()) as { success: boolean; "error-codes"?: string[] };
    if (data.success) return { status: "verified" };
    return { status: "failed", reason: data["error-codes"]?.join(",") ?? "rejected" };
  } catch (error) {
    return { status: "failed", reason: error instanceof Error ? error.message : "network_error" };
  }
}
