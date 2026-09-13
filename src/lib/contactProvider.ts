import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

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
 * Phase 1: writes the submission to Postgres first; that write is the
 * source of truth for "did this submission succeed." A best-effort Resend
 * notification email follows; if it fails or EMAIL_PROVIDER_API_KEY isn't
 * set, the submission is still considered successful (its emailSentAt stays
 * null, visible to admins in /admin, but nothing is lost and the visitor
 * never sees a failure for something outside their control).
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
  } catch (error) {
    console.error("[contactProvider] Failed to persist contact submission:", error);
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

  if (emailResult.sent) {
    // Best-effort: failure to record this timestamp is not worth failing the request over.
    await prisma.contactSubmission.update({ where: { id: submissionId }, data: { emailSentAt: new Date() } }).catch(() => {});
  }

  return { ok: true };
}
