"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Button } from "@/components/ui/Button";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { CONTACT_NAV, PRIMARY_NAV, STRATEGY_CALL_NAV } from "@/lib/site";
import { cn } from "@/lib/cn";
import { useScrollCompact } from "@/lib/useScrollCompact";

export function SiteHeader() {
  const pathname = usePathname();
  const compact = useScrollCompact(40);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  const links = [...PRIMARY_NAV, CONTACT_NAV];

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-(--ax-z-nav) grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-ax-border-subtle bg-[rgba(11,13,18,0.9)] backdrop-blur-md transition-[padding] duration-300",
          compact ? "py-3 px-6" : "py-[18px] px-7",
        )}
        style={{ zIndex: "var(--ax-z-nav)" }}
      >
        <div className="flex items-center justify-self-start">
          <TransitionLink href="/" className="flex items-center gap-2.5" aria-label="AXIEONEX home">
            <BrandMark material="spectral" size={compact ? 22 : 24} />
            <span className="text-[15px] font-display font-bold tracking-tight text-ax-text-primary">AXIEONEX</span>
          </TransitionLink>
        </div>

        <nav aria-label="Primary" className="hidden justify-self-center lg:block">
          <ul className="flex list-none items-center gap-[18px] whitespace-nowrap">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <TransitionLink
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="relative py-1 text-[14.5px] text-ax-text-muted transition-colors hover:text-ax-text-primary aria-[current=page]:text-ax-text-primary"
                  >
                    {link.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1 left-0 right-0 h-px bg-[image:var(--ax-gradient-signal)]"
                      />
                    ) : null}
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-self-end gap-3">
          {/*
            The visibility toggle lives on this wrapper, not on Button's own
            className: Button's base classes already set an unconditional
            `inline-flex`, which sits later in the generated stylesheet than
            a plain `hidden` override and wins the cascade tie regardless of
            viewport, silently keeping the button visible on mobile. A
            wrapper with no competing display utility avoids that collision.
          */}
          <div className="hidden lg:block">
            <Button href={STRATEGY_CALL_NAV.href} variant="primary">
              {STRATEGY_CALL_NAV.label}
            </Button>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-sm text-ax-text-primary lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="relative block h-4 w-6" aria-hidden="true">
              <span
                className={cn(
                  "absolute left-0 top-0 h-0.5 w-6 bg-current transition-transform duration-300",
                  menuOpen && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn("absolute left-0 top-1/2 h-0.5 w-6 -translate-y-1/2 bg-current transition-opacity duration-200", menuOpen && "opacity-0")}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-6 bg-current transition-transform duration-300",
                  menuOpen && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </header>
      <MobileNavigation isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
