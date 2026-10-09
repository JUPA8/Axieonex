import "server-only";

import { CONTACT_EMAIL } from "@/lib/site";
import { fetchWithTimeout, ProviderTimeoutError } from "@/lib/security/providerRequest";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";
const EMAIL_ADDRESS_PATTERN = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;

export type EmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "misconfigured" | "timeout" | "provider_error" };

/**
 * One POST to Resend, one recipient, no SDK.
 *
 * `to` is always a single address. Nothing here accepts a list, so a caller
 * cannot turn one submission into a fan-out, and there is no CC or BCC for a
 * third party to be quietly added to.
 */
async function send(to: string, subject: string, text: string): Promise<EmailResult> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY?.trim();
  const from = process.env.EMAIL_FROM_ADDRESS?.trim();
  if (!apiKey && !from) return { sent: false, reason: "not_configured" };
  if (!apiKey || !from || !EMAIL_ADDRESS_PATTERN.test(to)) {
    return { sent: false, reason: "misconfigured" };
  }

  try {
    const response = await fetchWithTimeout(RESEND_EMAILS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
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

/** Internal notification to the team's own mailbox. */
export async function sendNotificationEmail(params: { subject: string; text: string }): Promise<EmailResult> {
  const configuredRecipient = process.env.EMAIL_NOTIFICATION_RECIPIENT?.trim();
  return send(configuredRecipient || CONTACT_EMAIL, params.subject, params.text);
}

/**
 * Acknowledgement to the person who submitted the form.
 *
 * This is the one path that mails an address a stranger typed, so the body is
 * built here from a fixed template rather than accepted from the caller. A
 * submitter cannot place their own text into a message that leaves the
 * verified sending domain, which keeps the form from becoming a way to send
 * arbitrary mail to arbitrary people under the company's name.
 *
 * `purpose` is safe to echo because it is one of the five enquiry types the
 * form's own validation accepts; anything else is rejected before this runs.
 */
export async function sendContactAcknowledgementEmail(params: {
  to: string;
  purpose: string;
}): Promise<EmailResult> {
  const text = [
    "Thank you for contacting AXIEONEX.",
    "",
    `We have received your ${params.purpose} enquiry.`,
    // Mirrors the wording the contact form shows on submission, so the site
    // and this message never state two different response times.
    "We route enquiries to the right team and reply within one business day.",
    "",
    "This is an automated acknowledgement. Replying to it will not reach us;",
    `if you need to add anything, write to ${CONTACT_EMAIL}.`,
    "",
    "AXIEONEX",
  ].join("\n");

  return send(params.to, "We have received your enquiry | AXIEONEX", text);
}
