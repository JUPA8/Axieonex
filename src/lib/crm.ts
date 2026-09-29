import "server-only";

import { fetchWithTimeout, ProviderTimeoutError } from "@/lib/security/providerRequest";

const HUBSPOT_CONTACTS_UPSERT_URL = "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert";

export type CrmPushResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "timeout" | "provider_error" };

export type CrmContact = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  source: string;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName: firstName ?? fullName, lastName: rest.join(" ") };
}

function contactProperties(contact: CrmContact): Record<string, string | undefined> {
  const { firstName, lastName } = splitName(contact.name);
  const workspaceId = process.env.CRM_WORKSPACE_ID?.trim();
  return {
    email: contact.email.trim().toLowerCase(),
    firstname: firstName || undefined,
    lastname: lastName || undefined,
    company: contact.company || undefined,
    phone: contact.phone || undefined,
    axieonex_source: contact.source,
    axieonex_message: contact.message,
    ...(workspaceId ? { axieonex_workspace_id: workspaceId } : {}),
  };
}

function isSuccessfulUpsertResponse(value: unknown): boolean {
  if (typeof value !== "object" || value === null || !("results" in value)) return false;
  return Array.isArray(value.results) && value.results.length === 1 && typeof value.results[0] === "object" && value.results[0] !== null && typeof value.results[0].id === "string";
}

async function hubspotUpsert(properties: Record<string, string | undefined>, email: string, apiKey: string) {
  return fetchWithTimeout(HUBSPOT_CONTACTS_UPSERT_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: [{ id: email, idProperty: "email", properties }] }),
  });
}

/** Email-keyed HubSpot upsert avoids duplicate contacts while overwriting the
 * enquiry properties with the latest successfully synchronized context. */
export async function pushToCrm(contact: CrmContact): Promise<CrmPushResult> {
  const apiKey = process.env.CRM_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: "not_configured" };

  const properties = contactProperties(contact);
  try {
    const response = await hubspotUpsert(properties, contact.email.trim().toLowerCase(), apiKey);
    if (!response.ok) {
      console.error(`[crm] HubSpot contact upsert failed with status ${response.status}.`);
      return { ok: false, reason: "provider_error" };
    }
    const body = (await response.json()) as unknown;
    if (!isSuccessfulUpsertResponse(body)) {
      console.error("[crm] HubSpot contact upsert returned an invalid response.");
      return { ok: false, reason: "provider_error" };
    }
    return { ok: true };
  } catch (error) {
    const reason = error instanceof ProviderTimeoutError ? "timeout" : "provider_error";
    console.error(`[crm] HubSpot request failed (${reason}).`);
    return { ok: false, reason };
  }
}
