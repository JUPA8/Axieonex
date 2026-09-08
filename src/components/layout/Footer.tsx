import { BrandMark } from "@/components/brand/BrandMark";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CONTACT_EMAIL, COPYRIGHT_LINE, FOOTER_NAV_GROUPS, OPERATING_STATEMENT } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-ax-border-subtle bg-[#050609]">
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 py-16 sm:px-10 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <BrandMark material="spectral" size={20} />
            <span className="text-[15px] font-display font-bold text-ax-text-primary">AXIEONEX</span>
          </div>
          <p className="max-w-[36ch] text-sm leading-relaxed text-ax-text-muted">{OPERATING_STATEMENT}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-ax-text-body hover:text-ax-cyan-alt">
            {CONTACT_EMAIL}
          </a>
        </div>

        {FOOTER_NAV_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.06em] text-ax-text-muted">{group.title}</h2>
            <ul className="flex list-none flex-col gap-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <TransitionLink href={link.href} className="text-sm text-ax-text-body hover:text-ax-text-primary">
                    {link.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ax-border-subtle px-5 py-6 text-center text-xs text-ax-text-muted sm:px-10">
        {COPYRIGHT_LINE}
      </div>
    </footer>
  );
}
