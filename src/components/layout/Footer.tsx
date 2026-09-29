import { BrandMark } from "@/components/brand/BrandMark";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CONTACT_EMAIL, COPYRIGHT_LINE, FOOTER_NAV_GROUPS, OPERATING_STATEMENT } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-ax-border-subtle">
      <div className="ax-shell grid gap-x-12 gap-y-16 py-[clamp(64px,8vw,120px)] lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <BrandMark material="spectral" size={20} />
            <span className="font-display text-[15px] font-medium tracking-[-0.02em] text-ax-text-primary">
              AXIEONEX
            </span>
          </div>
          <p className="max-w-[34ch] text-sm font-light leading-relaxed text-ax-text-muted">{OPERATING_STATEMENT}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="-my-1.5 inline-block py-1.5 text-sm text-ax-text-body transition-colors hover:text-ax-violet"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        {FOOTER_NAV_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-ax-text-muted">
              {group.title}
            </h2>
            <ul className="flex list-none flex-col gap-3.5 p-0">
              {group.links.map((link) => (
                <li key={link.href}>
                  {/* py-1.5/-my-1.5 grow the tap target into the gap whitespace
                      without shifting visual position. */}
                  <TransitionLink
                    href={link.href}
                    className="-my-1.5 inline-block py-1.5 text-sm font-light text-ax-text-body transition-colors hover:text-ax-text-primary"
                  >
                    {link.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="ax-shell pb-12 text-[12px] text-ax-text-muted">{COPYRIGHT_LINE}</div>
    </footer>
  );
}
