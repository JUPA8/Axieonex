"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "axieonex-cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getConsentSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

/**
 * Reproduces the live site's cookie banner (see docs/LIVE_SITE_INVENTORY.md
 * §7). No third-party consent-management script was observed on the live
 * site, and this build loads no tracking scripts either, so the choice is
 * only persisted locally and doesn't gate anything yet.
 */
export function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, getConsentSnapshot, getServerSnapshot);
  const visible = consent === null;

  function choose(value: "accepted" | "rejected" | "dismissed") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
      window.dispatchEvent(new StorageEvent("storage"));
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg-raised)]"
    >
      <div className="container-page flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[var(--color-fg-muted)]">
          <p className="font-semibold text-[var(--color-fg)]">We value your privacy</p>
          <p className="mt-1">
            We use cookies to improve your experience. By continuing to use this site, you accept our use
            of cookies.{" "}
            <Link href="/cookies-policy" className="text-[var(--color-accent)] underline underline-offset-2">
              Read our Cookie Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("dismissed")}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            Manage Preferences
          </button>
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
          >
            Reject All
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-bold text-[#04141a] hover:bg-[var(--color-accent-strong)]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
