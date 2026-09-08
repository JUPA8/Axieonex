"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Wires every `[data-reveal]` element on the current page to an
 * IntersectionObserver, adding `.is-in` the first time it enters the
 * viewport (elements already visible on mount reveal immediately, so first
 * paint is never blank — see Motion Inventory section 2/6). Lives once in
 * the root layout and re-scans whenever the route changes, since page
 * content remounts under the persistent layout.
 */
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (elements.length === 0) return;

    const revealNow = (el: HTMLElement) => el.classList.add("is-in");

    if (typeof IntersectionObserver === "undefined") {
      elements.forEach(revealNow);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealNow(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (alreadyVisible) {
        revealNow(el);
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
