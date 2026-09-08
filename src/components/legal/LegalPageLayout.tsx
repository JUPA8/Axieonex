import { TransitionLink } from "@/components/transition/TransitionLink";

export type LegalSection = {
  id: string;
  heading: string;
  tocLabel: string;
  body: React.ReactNode;
};

export function LegalPageLayout({
  title,
  lastUpdated,
  warning,
  sections,
}: {
  title: string;
  lastUpdated: string;
  warning: string;
  sections: LegalSection[];
}) {
  return (
    <div data-theme="legal" className="bg-ax-surface-legal text-ax-text-primary">
      <div className="mx-auto max-w-[1180px] px-5 pb-24 pt-28 sm:px-10 sm:pt-36">
        <div className="mb-10">
          <div className="mb-4 text-[13px] font-semibold text-ax-cyan-alt">Legal</div>
          <h1 className="mb-3 text-[length:var(--ax-fs-h1-fluid)] font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-ax-text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div role="note" className="mb-12 rounded-md border border-ax-error/30 bg-ax-error/10 px-5 py-4 text-sm leading-relaxed text-ax-text-body">
          {warning}
        </div>

        <div className="grid gap-16 lg:grid-cols-[220px_1fr]">
          <nav aria-label={`${title} sections`} className="hidden lg:sticky lg:top-[110px] lg:block lg:h-fit">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">On this page</div>
            <ul className="flex list-none flex-col gap-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="block py-1 text-[12.5px] text-ax-text-muted hover:text-ax-text-primary">
                    {section.tocLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-[110px] border-t border-ax-border-subtle py-8 first:border-t-0 first:pt-0">
                <h2 className="mb-3 font-display text-lg font-bold">{section.heading}</h2>
                <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-ax-text-body">{section.body}</div>
              </section>
            ))}
          </div>
        </div>

        <TransitionLink href="/" className="mt-16 inline-block text-sm text-ax-text-muted hover:text-ax-text-primary">
          ← Back to the main website
        </TransitionLink>
      </div>
    </div>
  );
}
