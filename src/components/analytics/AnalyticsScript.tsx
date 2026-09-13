"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { CONSENT_CHANGE_EVENT, hasConsentFor } from "@/lib/consent";

/**
 * Plausible Analytics (https://plausible.io), chosen as the default option
 * because it's cookie-free, privacy-by-design, and GDPR-compliant without
 * needing its own consent banner, a reasonable fit for a site that already
 * gates everything non-essential behind Cookie Preferences. This is a
 * default pick documented here, not a final owner decision: swap the
 * script src/attributes below if a different provider is chosen instead.
 *
 * ANALYTICS_PROVIDER_ID maps to the Plausible "domain" identifier. Even
 * with it set, the script only renders once the visitor has granted
 * "analytics" consent (checked live, re-evaluated on every consent change),
 * reading the real persisted consent state (src/lib/consent.ts), not just a
 * cosmetic toggle that gets ignored.
 */
function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot() {
  return false;
}

export function AnalyticsScript({ domain }: { domain?: string }) {
  const hasAnalyticsConsent = useSyncExternalStore(subscribe, () => hasConsentFor("analytics"), getServerSnapshot);

  if (!domain || !hasAnalyticsConsent) return null;

  return <Script defer data-domain={domain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />;
}
