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
      className="fixed inset-0 z-(--ax-z-mobile-nav) flex flex-col bg-ax-surface-base/98 px-6 pb-10 pt-28 backdrop-blur-md lg:hidden"
      style={{ zIndex: "var(--ax-z-mobile-nav)" }}
    >
      <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-2">
        {[...PRIMARY_NAV, CONTACT_NAV].map((link) => {
          const active = pathname === link.href;
          return (
            <TransitionLink
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className="flex min-h-11 items-center border-b border-ax-border-subtle py-4 text-2xl font-display font-medium text-ax-text-primary transition-colors hover:text-ax-cyan-alt aria-[current=page]:text-ax-cyan-alt"
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
