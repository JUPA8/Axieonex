"use client";

import { useSyncExternalStore } from "react";

/** Nothing to subscribe to: the value flips once, when React hydrates. */
const subscribe = () => () => {};

/**
 * False during the server render and the first client render, true afterwards.
 *
 * Use it when a component has to render its plain, universally readable markup
 * first and only then upgrade to a browser-only presentation (a pinned scroll
 * stage, a canvas, a measured layout). Deriving the flag this way keeps the
 * two renders identical, so there is no hydration mismatch and no state write
 * inside an effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
