export type ConsentCategory = "necessary" | "functional" | "analytics" | "preferences" | "marketing";

export type ConsentState = Record<ConsentCategory, boolean>;

export type StoredConsent = {
  version: number;
  categories: ConsentState;
  updatedAt: string;
};

/** Bump when the categories on offer change, so a returning visitor is re-prompted. */
export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "axieonex-cookie-consent";
export const CONSENT_CHANGE_EVENT = "axieonex-consent-change";

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  functional: false,
  analytics: false,
  preferences: false,
  marketing: false,
};

export const ALL_ACCEPTED_CONSENT: ConsentState = {
  necessary: true,
  functional: true,
  analytics: true,
  preferences: true,
  marketing: true,
};

/**
 * Backend Phase 3: consent is now durably recorded server-side
 * (ConsentRecord in Postgres, via src/app/api/consent/route.ts), correlated
 * to the visitor through an HttpOnly cookie rather than a third-party
 * tracker. localStorage remains as a fast, synchronous client-side cache
 * (readConsent/hasConsentFor stay sync so script-gating checks don't need
 * to be async everywhere), but it is a cache of that server record, not the
 * source of truth. If the two ever disagree, syncConsentFromServer()
 * reconciles the cache to the server on mount.
 *
 * If this throws or is unavailable, the caller must treat the visitor as
 * having given no consent; never default to granting optional categories.
 */
export function readConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalCache(record: StoredConsent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: record }));
  } catch {
    // If storage is unavailable, fail closed: no optional scripts will read
    // a granted category back, so nothing non-essential loads.
  }
}

/**
 * Applies a consent choice: updates the local cache immediately (so the UI
 * and any consent-gated scripts react without waiting on a network round
 * trip), then persists it to the server as the durable/auditable copy. A
 * failed server write is logged but doesn't roll back the local choice;
 * the visitor's in-browser experience already reflects their decision
 * correctly even if the audit copy has to catch up later.
 */
export async function writeConsent(categories: ConsentState): Promise<StoredConsent> {
  const record: StoredConsent = {
    version: CONSENT_VERSION,
    categories: { ...categories, necessary: true },
    updatedAt: new Date().toISOString(),
  };
  writeLocalCache(record);

  try {
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: record.categories }),
    });
  } catch (error) {
    console.error("[consent] Failed to persist consent to the server:", error);
  }

  return record;
}

/**
 * Reconciles the local cache with the server's record on load, for a
 * visitor whose localStorage was cleared (or who's on a new device but
 * somehow retained the same visitor cookie via a synced browser profile).
 * Never overwrites a local choice with a server "no record"; only adopts
 * the server's record when the local cache is empty or stale.
 */
export async function syncConsentFromServer(): Promise<void> {
  if (readConsent()) return;

  try {
    const response = await fetch("/api/consent");
    if (!response.ok) return;
    const body = (await response.json()) as { record: StoredConsent | null };
    if (body.record) writeLocalCache(body.record);
  } catch (error) {
    console.error("[consent] Failed to sync consent from the server:", error);
  }
}

export function hasConsentFor(category: ConsentCategory): boolean {
  const record = readConsent();
  if (!record) return false;
  return Boolean(record.categories[category]);
}
