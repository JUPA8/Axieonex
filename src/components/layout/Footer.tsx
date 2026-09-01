import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FOOTER_NAV, LEGAL_NAV, SERVICES, SITE } from "@/content/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-raised)]">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-[var(--color-fg-muted)]">{SITE.description}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="space-y-2.5">
            {FOOTER_NAV.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-2.5 text-sm font-bold text-[var(--color-fg)]">Our Services</h2>
          <ul className="space-y-2.5">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link href={service.href} className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-2.5 text-sm font-bold text-[var(--color-fg)]">Contact & Legal</h2>
          <ul className="space-y-2.5 text-sm text-[var(--color-fg-muted)]">
            <li>
              Email:{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="hover:text-[var(--color-fg)]">
                {SITE.contactEmail}
              </a>
            </li>
            <li>{SITE.operatingRegion}</li>
            {LEGAL_NAV.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[var(--color-fg)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-[var(--color-border)]">
        <Container className="flex flex-col gap-2 py-5 text-xs text-[var(--color-fg-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>{SITE.copyright}</p>
          <p>{SITE.footerTagline}</p>
        </Container>
      </div>
    </footer>
  );
}
