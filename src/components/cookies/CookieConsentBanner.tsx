"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/transition/TransitionLink";
import {
  ALL_ACCEPTED_CONSENT,
  CONSENT_CHANGE_EVENT,
  DEFAULT_CONSENT,
  readConsent,
  writeConsent,
} from "@/lib/consent";

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return readConsent() === null;
}

function getServerSnapshot() {
  return false;
}

export function CookieConsentBanner() {
  const pathname = usePathname();
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (pathname === "/cookie-preferences" || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-(--ax-z-modal) border-t border-ax-border-default bg-[#0b0d12] px-5 py-5 sm:px-10"
      style={{ zIndex: "var(--ax-z-modal)" }}
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[60ch] text-sm text-ax-text-body">
          We use strictly necessary cookies to run this site, and optional cookies for functionality, analytics,
          preferences, and marketing only with your consent.{" "}
          <TransitionLink href="/cookies" className="underline hover:text-ax-text-primary">
            Cookies Policy
          </TransitionLink>
          .
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <TransitionLink
            href="/cookie-preferences"
            className="min-h-11 rounded-sm border border-ax-border-default px-4 py-2.5 text-sm text-ax-text-primary hover:border-ax-text-primary"
          >
            Manage preferences
          </TransitionLink>
          <button
            type="button"
            onClick={() => writeConsent(DEFAULT_CONSENT)}
            className="min-h-11 rounded-sm border border-ax-border-default px-4 py-2.5 text-sm text-ax-text-primary hover:border-ax-text-primary"
          >
            Reject optional
          </button>
          <button
            type="button"
            onClick={() => writeConsent(ALL_ACCEPTED_CONSENT)}
            className="min-h-11 rounded-sm bg-[image:var(--ax-gradient-spectral)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
