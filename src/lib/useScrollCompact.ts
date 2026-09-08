"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getServerSnapshot() {
  return false;
}

/** True once the page has scrolled past `threshold`, for the header's compact state. */
export function useScrollCompact(threshold = 40): boolean {
  return useSyncExternalStore(subscribe, () => window.scrollY > threshold, getServerSnapshot);
}
