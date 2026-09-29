import { TransitionLink } from "@/components/transition/TransitionLink";
import { SceneBackdrop } from "@/components/motion/SceneBackdrop";

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
    <div data-theme="legal">
      {/* Legal pages run the same environment at a lower intensity: present,
          but never competing with dense reading. */}
      <SceneBackdrop fallbackForm="field" intensity={0.42} />
      <div data-scene="field" className="relative z-10 ax-shell pb-[clamp(72px,10vw,140px)] pt-[clamp(120px,15vh,180px)]">
        <div className="mb-14">
          <p className="ax-label mb-7">Legal</p>
          <h1 className="ax-headline m-0 mb-5 text-ax-text-primary">{title}</h1>
          <p className="text-sm font-light text-ax-text-muted">Last updated: {lastUpdated}</p>
        </div>

        <div role="note" className="mb-16 border-l-2 border-ax-warning/60 py-2 pl-6 text-sm font-light leading-relaxed text-ax-text-body">
          {warning}
        </div>

        <div className="ax-veil grid gap-x-16 gap-y-12 lg:grid-cols-[240px_1fr]">
          <nav aria-label={`${title} sections`} className="hidden lg:sticky lg:top-[110px] lg:block lg:h-fit">
            <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ax-text-muted">On this page</div>
            <ul className="flex list-none flex-col gap-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="block py-1.5 text-[13px] font-light text-ax-text-muted transition-colors hover:text-ax-text-primary">
                    {section.tocLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-[110px] border-t border-ax-border-subtle py-10 first:border-t-0 first:pt-0">
                <h2 className="mb-5 font-display text-[21px] font-normal tracking-[-0.02em] text-ax-text-primary">{section.heading}</h2>
                <div className="flex flex-col gap-4 text-[15px] font-light leading-relaxed text-ax-text-body">{section.body}</div>
              </section>
            ))}
          </div>
        </div>

        <TransitionLink href="/" className="mt-20 inline-block text-[12px] font-semibold uppercase tracking-[0.1em] text-ax-text-muted transition-colors hover:text-ax-text-primary">
          ← Back to the main website
        </TransitionLink>
      </div>
    </div>
  );
}
