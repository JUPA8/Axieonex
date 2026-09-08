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
 * Reads the stored consent record. Production note: this is a localStorage-backed
 * stand-in for a real consent-management platform, as explicitly authorized as the
 * current mocked behavior in axieonex-integrations.json ("Cookie consent /
 * optional-script blocking", status: mocked pending CMP/vendor decision). If this
 * throws or is unavailable, the caller must treat the visitor as having given no
 * consent; never default to granting optional categories.
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

export function writeConsent(categories: ConsentState): StoredConsent | null {
  const record: StoredConsent = {
    version: CONSENT_VERSION,
    categories: { ...categories, necessary: true },
    updatedAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") return record;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: record }));
  } catch {
    // If storage is unavailable, fail closed: no optional scripts will read a
    // granted category back, so nothing non-essential loads.
  }
  return record;
}

export function hasConsentFor(category: ConsentCategory): boolean {
  const record = readConsent();
  if (!record) return false;
  return Boolean(record.categories[category]);
}
