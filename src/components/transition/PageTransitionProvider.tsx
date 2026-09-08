"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { destinationFilter, getDestinationForPath, isNativeHref, isPlainLeftClick } from "@/lib/transitions";

type Phase = "idle" | "exiting" | "entering";

type TransitionContextValue = {
  navigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransitionNavigate(): TransitionContextValue["navigate"] {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransitionNavigate must be used within PageTransitionProvider");
  return ctx.navigate;
}

const DURATION_SLOW = 720;
const DURATION_REDUCED = 120;
const OVERLAY_FADE = 320;

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [markFilter, setMarkFilter] = useState<string>("none");
  const [label, setLabel] = useState<string>("");
  const busyRef = useRef(false);
  const pendingRef = useRef(false);
  const previousPathname = useRef(pathname);
  const mainFocusTargetRef = useRef<string | null>(null);

  const navigate = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!isPlainLeftClick(event)) return;
      if (isNativeHref(href)) return;
      if (href === pathname) {
        event.preventDefault();
        return;
      }
      if (busyRef.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      busyRef.current = true;
      pendingRef.current = true;

      const reduced =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const destination = getDestinationForPath(href.split("?")[0]);
      setLabel(destination.label);

      if (reduced) {
        setPhase("exiting");
        window.setTimeout(() => router.push(href), DURATION_REDUCED);
        return;
      }

      setMarkFilter(destinationFilter(destination));
      setPhase("exiting");
      window.setTimeout(() => router.push(href), DURATION_SLOW);
    },
    [pathname, router],
  );

  // Once the new route has actually rendered (pathname changed) after a link-driven
  // navigation, cross-fade the overlay out and hand focus to the new page's main
  // landmark. Browser back/forward and any navigation we did not initiate ourselves
  // never sets pendingRef, so this intentionally does nothing extra for those.
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    if (pendingRef.current) {
      pendingRef.current = false;
      setPhase("entering");
      const fadeTimer = window.setTimeout(() => {
        setPhase("idle");
        setMarkFilter("none");
        busyRef.current = false;
      }, OVERLAY_FADE);
      mainFocusTargetRef.current = "pending";
      return () => window.clearTimeout(fadeTimer);
    }
  }, [pathname]);

  // Focus management: after any pathname change (transition-driven or not — covers
  // back/forward and non-intercepted navigations too), move focus to the main
  // landmark unless the user already has focus somewhere meaningful.
  useEffect(() => {
    const active = document.activeElement;
    const shouldRefocus = !active || active === document.body;
    if (!shouldRefocus) return;
    const main = document.getElementById("main-content");
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: false });
    }
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-(--ax-z-transition-overlay) flex items-center justify-center transition-opacity"
        style={{
          zIndex: "var(--ax-z-transition-overlay)",
          background: "var(--ax-overlay-bg)",
          opacity: phase === "idle" ? 0 : 1,
          transitionDuration: `${OVERLAY_FADE}ms`,
          transitionTimingFunction: "var(--ax-ease-standard)",
        }}
        data-transition-label={label || undefined}
      >
        <div
          style={{
            width: "var(--ax-logo-size-transition-mark)",
            height: "var(--ax-logo-size-transition-mark)",
            filter: markFilter,
            transform: phase === "exiting" ? "scale(var(--ax-overlay-mark-scale-end))" : "scale(var(--ax-overlay-mark-scale-start))",
            opacity: phase === "exiting" ? 1 : 0.7,
            transition: `transform ${DURATION_REDUCED}ms var(--ax-ease-standard), opacity ${DURATION_REDUCED}ms var(--ax-ease-standard)`,
          }}
        >
          <BrandMark material="spectral" size={56} />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
