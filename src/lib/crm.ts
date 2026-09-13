/**
 * HubSpot CRM push (Contacts API v3: https://developers.hubspot.com/docs/api/crm/contacts).
 *
 * Why HubSpot: extremely common CRM for B2B/SMB marketing sites, a generous
 * free tier, and a simple bearer-token ("Private App") auth model with no
 * separate account/portal identifier required per request, unlike some
 * CRMs' API shapes.
 *
 * CRM_API_KEY maps to a HubSpot Private App access token (Settings >
 * Integrations > Private Apps, with the `crm.objects.contacts.write`
 * scope). CRM_WORKSPACE_ID is not required by HubSpot's API (the token
 * itself is already scoped to one account) and is only used here as an
 * informational custom property on the created contact, in case a
 * multi-account setup wants to distinguish where a lead originated. If a
 * different CRM is chosen later, replace this file; the call sites
 * (contactProvider.ts, bookingProvider.ts) only depend on `pushToCrm`'s
 * signature, not on HubSpot specifically.
 *
 * IMPORTANT: implemented against HubSpot's documented v3 request/response
 * shape, but has not been exercised against a live HubSpot account (none
 * was available to test with), no credentials were invented to work
 * around that. Verify against a real sandbox account before relying on
 * this in production.
 */

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export type CrmPushResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

export type CrmContact = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  /** Freeform note capturing the enquiry/booking context, stored as a HubSpot contact note-ish custom property. */
  message: string;
  /** A short label distinguishing where this lead came from (e.g. "contact_form", "book_strategy_call"). */
  source: string;
};

function isConfigured(): boolean {
  return Boolean(process.env.CRM_API_KEY);
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName: firstName ?? fullName, lastName: rest.join(" ") };
}

/**
 * Pushes a lead to HubSpot as a contact. Returns "not_configured" without
 * making a network call when CRM_API_KEY is unset; callers should treat
 * that the same as any other optional, gracefully-degraded integration
 * (log and move on, never fail the request that triggered it).
 */
export async function pushToCrm(contact: CrmContact): Promise<CrmPushResult> {
  if (!isConfigured()) return { ok: false, reason: "not_configured" };

  const apiKey = process.env.CRM_API_KEY;
  const workspaceId = process.env.CRM_WORKSPACE_ID;
  const { firstName, lastName } = splitName(contact.name);

  try {
    const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          email: contact.email,
          firstname: firstName || undefined,
          lastname: lastName || undefined,
          company: contact.company || undefined,
          phone: contact.phone || undefined,
          axieonex_source: contact.source,
          axieonex_message: contact.message,
          ...(workspaceId ? { axieonex_workspace_id: workspaceId } : {}),
        },
      }),
    });

    if (response.ok) return { ok: true };

    // HubSpot returns 409 when a contact with this email already exists;
    // that's not a failure worth surfacing, the lead is already in the CRM.
    if (response.status === 409) return { ok: true };

    const text = await response.text().catch(() => "");
    console.error(`[crm] HubSpot contact push failed with status ${response.status}:`, text);
    return { ok: false, reason: "send_failed" };
  } catch (error) {
    console.error("[crm] Failed to push contact to HubSpot:", error);
    return { ok: false, reason: "send_failed" };
  }
}
