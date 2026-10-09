import { prisma } from "@/lib/prisma";
import { pushToCrm } from "@/lib/crm";
import { sendContactAcknowledgementEmail, sendNotificationEmail } from "@/lib/email";
import { providerStateFromResult } from "@/lib/providerState";

export type ContactFormPayload = {
  purpose: string;
  name: string;
  email: string;
  company: string;
  message: string;
  ipAddress: string;
};

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

/**
 * Server-side persistence boundary for the Contact form.
 *
 * Writes the submission to Postgres first; that write is the source of
 * truth for "did this submission succeed." A best-effort Resend
 * notification email and HubSpot CRM push follow (Phase 2 for the CRM
 * push); if either fails or its env vars aren't set, the submission is
 * still considered successful, nothing is lost and the visitor never sees
 * a failure for something outside their control.
 *
 * If DATABASE_URL itself isn't configured, Prisma throws on the first query;
 * that's caught here and reported as "not_configured" rather than crashing
 * the request or claiming a fake success.
 */
export async function sendContactForm(payload: ContactFormPayload): Promise<SendResult> {
  let submissionId: string;
  try {
    const submission = await prisma.contactSubmission.create({
      data: {
        purpose: payload.purpose,
        name: payload.name,
        email: payload.email,
        company: payload.company || null,
        message: payload.message,
        ipAddress: payload.ipAddress,
      },
    });
    submissionId = submission.id;
  } catch {
    console.error("[contactProvider] Failed to persist contact submission.");
    return { ok: false, reason: "not_configured" };
  }

  const emailResult = await sendNotificationEmail({
    subject: `New contact enquiry: ${payload.purpose}`,
    text: [
      `Purpose: ${payload.purpose}`,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Company: ${payload.company || "(not provided)"}`,
      "",
      payload.message,
    ].join("\n"),
  });

  const emailStateUpdatedAt = new Date();
  await prisma.contactSubmission
    .update({
      where: { id: submissionId },
      data: {
        emailState: providerStateFromResult(emailResult.sent, emailResult.sent ? undefined : emailResult.reason),
        emailStateUpdatedAt,
        ...(emailResult.sent ? { emailSentAt: emailStateUpdatedAt } : {}),
      },
    })
    .catch(() => {});

  // Acknowledgement to the submitter, strictly best effort and deliberately
  // last among the email work. The internal notification above is what the
  // business depends on; if this one fails the enquiry is still recorded and
  // still delivered, so nothing about the result depends on it. Resend's own
  // log is the audit trail for it, which is why no column tracks it here.
  await sendContactAcknowledgementEmail({ to: payload.email, purpose: payload.purpose }).catch(() => {
    console.error("[contactProvider] Acknowledgement email threw unexpectedly.");
  });

  const crmResult = await pushToCrm({
    name: payload.name,
    email: payload.email,
    company: payload.company || undefined,
    message: `[${payload.purpose}] ${payload.message}`,
    source: "contact_form",
  });

  const crmStateUpdatedAt = new Date();
  await prisma.contactSubmission
    .update({
      where: { id: submissionId },
      data: {
        crmState: providerStateFromResult(crmResult.ok, crmResult.ok ? undefined : crmResult.reason),
        crmStateUpdatedAt,
        ...(crmResult.ok ? { crmSyncedAt: crmStateUpdatedAt } : {}),
      },
    })
    .catch(() => {});

  return { ok: true };
}
