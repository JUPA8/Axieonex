import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/site";

export type EmailResult = { sent: true } | { sent: false; reason: "not_configured" | "send_failed" };

let client: Resend | null | undefined;

function getClient(): Resend | null {
  if (client !== undefined) return client;
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  client = apiKey ? new Resend(apiKey) : null;
  return client;
}

/**
 * Sends a plain internal notification email via Resend. Never throws: a
 * failed or unconfigured send is reported back as a result the caller can
 * log, never something that should abort a request that already persisted
 * its data to the database.
 */
export async function sendNotificationEmail(params: { subject: string; text: string }): Promise<EmailResult> {
  const resend = getClient();
  const from = process.env.EMAIL_FROM_ADDRESS;
  if (!resend || !from) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: CONTACT_EMAIL,
      subject: params.subject,
      text: params.text,
    });
    if (error) {
      console.error("[email] Resend rejected the notification:", error);
      return { sent: false, reason: "send_failed" };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] Failed to send notification:", error);
    return { sent: false, reason: "send_failed" };
  }
}
