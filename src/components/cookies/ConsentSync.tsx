"use client";

import { useEffect } from "react";
import { syncConsentFromServer } from "@/lib/consent";

/**
 * Reconciles the local consent cache with the server's durable record once
 * per app load (e.g. a returning visitor whose localStorage was cleared but
 * who still carries the httpOnly visitor cookie). Renders nothing; lives
 * once in the root layout alongside CookieConsentBanner.
 */
export function ConsentSync() {
  useEffect(() => {
    syncConsentFromServer();
  }, []);

  return null;
}
