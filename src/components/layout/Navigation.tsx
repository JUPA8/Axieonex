"use client";

import Link from "next/link";
import { useState } from "react";
import { PRIMARY_NAV, SERVICES } from "@/content/site";
import { cn } from "@/lib/cn";

export function Navigation() {
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
      <Link
        href={PRIMARY_NAV[0].href}
        className="text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
      >
        {PRIMARY_NAV[0].label}
      </Link>

      <div
        className="relative"
        onMouseEnter={() => setServicesOpen(true)}
        onMouseLeave={() => setServicesOpen(false)}
      >
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={servicesOpen}
          onClick={() => setServicesOpen((v) => !v)}
          className="flex items-center gap-1 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
        >
          Services
          <span aria-hidden="true" className={cn("text-xs transition-transform", servicesOpen && "rotate-180")}>
            ▾
          </span>
        </button>
        <div
          hidden={!servicesOpen}
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-2 shadow-xl"
        >
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={service.href}
              className="block rounded-lg px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-fg)]"
            >
              {service.label}
            </Link>
          ))}
        </div>
      </div>

      {PRIMARY_NAV.slice(1).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
