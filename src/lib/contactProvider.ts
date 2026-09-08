export type ContactFormPayload = {
  purpose: string;
  name: string;
  email: string;
  company: string;
  message: string;
};

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

/**
 * Server-side delivery boundary for the Contact form. No provider has been
 * selected yet (see axieonex-integrations.json, "Contact form delivery",
 * status: mocked, pending provider selection), so CONTACT_FORM_ENDPOINT is
 * intentionally left unset in .env.example. Until an owner configures it,
 * this honestly reports "not_configured" rather than a fake success.
 */
export async function sendContactForm(payload: ContactFormPayload): Promise<SendResult> {
  const endpoint = process.env.CONTACT_FORM_ENDPOINT;
  if (!endpoint) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return { ok: false, reason: "send_failed" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "send_failed" };
  }
}
