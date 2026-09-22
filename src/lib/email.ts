import "server-only";

import { CONTACT_EMAIL } from "@/lib/site";
import { fetchWithTimeout, ProviderTimeoutError } from "@/lib/security/providerRequest";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export type EmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "misconfigured" | "timeout" | "provider_error" };

export async function sendNotificationEmail(params: { subject: string; text: string }): Promise<EmailResult> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY?.trim();
  const from = process.env.EMAIL_FROM_ADDRESS?.trim();
  if (!apiKey && !from) return { sent: false, reason: "not_configured" };
  if (!apiKey || !from) return { sent: false, reason: "misconfigured" };

  try {
    const response = await fetchWithTimeout(RESEND_EMAILS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [CONTACT_EMAIL], subject: params.subject, text: params.text }),
    });
    if (!response.ok) {
      console.error(`[email] Resend request failed with status ${response.status}.`);
      return { sent: false, reason: "provider_error" };
    }
    const body = (await response.json()) as unknown;
    if (typeof body !== "object" || body === null || !("id" in body) || typeof body.id !== "string" || !body.id) {
      console.error("[email] Resend returned an invalid response.");
      return { sent: false, reason: "provider_error" };
    }
    return { sent: true };
  } catch (error) {
    const reason = error instanceof ProviderTimeoutError ? "timeout" : "provider_error";
    console.error(`[email] Resend request failed (${reason}).`);
    return { sent: false, reason };
  }
}
