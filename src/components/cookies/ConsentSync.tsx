"use client";

import { useEffect } from "react";
import { syncConsentFromServer } from "@/lib/consent";

/**
 * Reconciles the local consent cache with the server's durable record once
 * per app load. It restores a missing local cache, adopts a newer durable
 * record, or makes one bounded retry for a newer/pending local choice.
 * Renders nothing; lives once in the root layout alongside CookieConsentBanner.
 */
export function ConsentSync() {
  useEffect(() => {
    syncConsentFromServer();
  }, []);

  return null;
}
