"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Button } from "@/components/ui/Button";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { CONTACT_NAV, PRIMARY_NAV, STRATEGY_CALL_NAV } from "@/lib/site";

export function MobileNavigation({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useFocusTrap(panelRef, isOpen, onClose);

  return (
    <div
      ref={panelRef}
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      hidden={!isOpen}
      className="fixed inset-0 z-(--ax-z-mobile-nav) flex flex-col bg-black px-[clamp(20px,6vw,48px)] pb-12 pt-28 lg:hidden"
      style={{ zIndex: "var(--ax-z-mobile-nav)" }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute right-[clamp(16px,5vw,44px)] top-6 flex h-11 w-11 items-center justify-center text-3xl font-extralight text-ax-text-primary"
      >
        <span aria-hidden="true">&times;</span>
      </button>
      <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
        {[...PRIMARY_NAV, CONTACT_NAV].map((link) => {
          const active = pathname === link.href;
          return (
            <TransitionLink
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className="flex min-h-11 items-center border-b border-ax-border-subtle py-6 font-display text-[clamp(26px,8vw,38px)] font-normal tracking-[-0.03em] text-ax-text-primary transition-colors hover:text-ax-violet aria-[current=page]:text-ax-violet"
            >
              {link.label}
            </TransitionLink>
          );
        })}
      </nav>
      <Button href={STRATEGY_CALL_NAV.href} variant="primary" size="large" className="w-full" onClick={onClose}>
        {STRATEGY_CALL_NAV.label}
      </Button>
    </div>
  );
}
