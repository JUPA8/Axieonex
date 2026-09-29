export type ConsentCategory = "necessary" | "functional" | "analytics" | "preferences" | "marketing";

export type ConsentState = Record<ConsentCategory, boolean>;

export type StoredConsent = {
  version: number;
  categories: ConsentState;
  updatedAt: string;
  pendingSync?: true;
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

const CONSENT_CATEGORIES: ConsentCategory[] = ["necessary", "functional", "analytics", "preferences", "marketing"];

function isConsentState(value: unknown): value is ConsentState {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    Object.keys(record).length === CONSENT_CATEGORIES.length &&
    CONSENT_CATEGORIES.every((category) => typeof record[category] === "boolean") &&
    record.necessary === true
  );
}

function parseStoredConsent(value: unknown, allowPending: boolean): StoredConsent | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const allowedKeys = allowPending ? ["version", "categories", "updatedAt", "pendingSync"] : ["version", "categories", "updatedAt"];
  if (!Object.keys(record).every((key) => allowedKeys.includes(key))) return null;
  if (record.version !== CONSENT_VERSION || !isConsentState(record.categories)) return null;
  if (typeof record.updatedAt !== "string" || Number.isNaN(Date.parse(record.updatedAt))) return null;
  if (record.pendingSync !== undefined && record.pendingSync !== true) return null;
  return {
    version: CONSENT_VERSION,
    categories: record.categories,
    updatedAt: record.updatedAt,
    ...(record.pendingSync === true ? { pendingSync: true as const } : {}),
  };
}

function sameCategories(left: ConsentState, right: ConsentState): boolean {
  return CONSENT_CATEGORIES.every((category) => left[category] === right[category]);
}

/**
 * Backend Phase 3: consent is now durably recorded server-side
 * (ConsentRecord in Postgres, via src/app/api/consent/route.ts), correlated
 * to the visitor through an HttpOnly cookie rather than a third-party
 * tracker. localStorage remains as a fast, synchronous client-side cache
 * (readConsent/hasConsentFor stay sync so script-gating checks don't need
 * to be async everywhere), but it is a cache of that server record, not the
 * source of truth. A minimal pendingSync flag records an unconfirmed server
 * write without storing any identifier or provider detail. On mount,
 * syncConsentFromServer() compares timestamps and retries at most once.
 *
 * If this throws or is unavailable, the caller must treat the visitor as
 * having given no consent; never default to granting optional categories.
 */
export function readConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return parseStoredConsent(JSON.parse(raw), true);
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

async function persistConsent(categories: ConsentState): Promise<StoredConsent | null> {
  try {
    const response = await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { record?: unknown };
    const record = parseStoredConsent(body.record, false);
    return record && sameCategories(record.categories, categories) ? record : null;
  } catch {
    return null;
  }
}

/**
 * Applies a consent choice: updates the local cache immediately (so the UI
 * and any consent-gated scripts react without waiting on a network round
 * trip), then persists it to the server as the durable/auditable copy. A
 * failed server write is marked pending but doesn't roll back the local
 * choice; the visitor's in-browser experience already reflects their
 * decision while a later bounded sync can repair the audit copy.
 */
export async function writeConsent(categories: ConsentState): Promise<StoredConsent> {
  const pendingRecord: StoredConsent = {
    version: CONSENT_VERSION,
    categories: { ...categories, necessary: true },
    updatedAt: new Date().toISOString(),
    pendingSync: true,
  };
  writeLocalCache(pendingRecord);

  const persisted = await persistConsent(pendingRecord.categories);
  if (!persisted) {
    console.error("[consent] Failed to persist consent to the server.");
    return pendingRecord;
  }
  writeLocalCache(persisted);
  return persisted;
}

/**
 * Reconciles the local cache with the server's record on load, for a
 * visitor whose localStorage was cleared (or who's on a new device but
 * somehow retained the same visitor cookie via a synced browser profile).
 * It adopts a newer server record, preserves and retries a newer local record,
 * and repairs legacy local records for which the server has no durable copy.
 */
let syncInFlight: Promise<void> | null = null;

async function runConsentSync(): Promise<void> {
  const local = readConsent();
  try {
    const response = await fetch("/api/consent");
    if (!response.ok) return;
    const body = (await response.json()) as { record?: unknown };
    const server = body.record === null ? null : parseStoredConsent(body.record, false);
    if (body.record !== null && !server) return;

    if (!local) {
      if (server) writeLocalCache(server);
      return;
    }

    const localTimestamp = Date.parse(local.updatedAt);
    const serverTimestamp = server ? Date.parse(server.updatedAt) : Number.NEGATIVE_INFINITY;
    if (server && serverTimestamp > localTimestamp) {
      writeLocalCache(server);
      return;
    }
    if (server && serverTimestamp === localTimestamp && sameCategories(server.categories, local.categories)) {
      if (local.pendingSync) writeLocalCache(server);
      return;
    }

    const pendingRecord: StoredConsent = { ...local, pendingSync: true };
    if (!local.pendingSync) writeLocalCache(pendingRecord);
    const persisted = await persistConsent(local.categories);
    if (persisted) writeLocalCache(persisted);
  } catch {
    console.error("[consent] Failed to sync consent from the server.");
  }
}

export async function syncConsentFromServer(): Promise<void> {
  if (syncInFlight) return syncInFlight;
  syncInFlight = runConsentSync();
  try {
    await syncInFlight;
  } finally {
    syncInFlight = null;
  }
}

export function hasConsentFor(category: ConsentCategory): boolean {
  const record = readConsent();
  if (!record) return false;
  return Boolean(record.categories[category]);
}
