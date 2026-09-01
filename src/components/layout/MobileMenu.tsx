"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV, SERVICES } from "@/content/site";
import { DemoCtaButton } from "@/features/contact/DemoCtaButton";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu when navigating, without an effect: adjust state during
  // render itself (the pattern React recommends for "reset state when a prop
  // changes" — see https://react.dev/learn/you-might-not-need-an-effect).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-md p-2 text-[var(--color-fg)]"
      >
        {isOpen ? (
          <span aria-hidden="true" className="block text-2xl leading-none">
            ✕
          </span>
        ) : (
          <span aria-hidden="true" className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-6 bg-current" />
            <span className="block h-0.5 w-6 bg-current" />
            <span className="block h-0.5 w-6 bg-current" />
          </span>
        )}
      </button>

      {isOpen ? (
        <div className="fixed inset-x-0 top-[var(--header-h,64px)] bottom-0 z-40 overflow-y-auto bg-[var(--color-bg)] px-6 py-8">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            <Link href={PRIMARY_NAV[0].href} className="rounded-lg px-3 py-3 text-base text-[var(--color-fg)]">
              {PRIMARY_NAV[0].label}
            </Link>

            <p className="mt-2 px-3 text-xs font-bold uppercase tracking-wide text-[var(--color-fg-subtle)]">
              Services
            </p>
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={service.href}
                className="rounded-lg px-3 py-2.5 text-sm text-[var(--color-fg-muted)]"
              >
                {service.label}
              </Link>
            ))}

            {PRIMARY_NAV.slice(1).map((link) => (
              <Link key={link.href} href={link.href} className="mt-2 rounded-lg px-3 py-3 text-base text-[var(--color-fg)]">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6">
            <DemoCtaButton className="w-full">Book a Strategy Call</DemoCtaButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
