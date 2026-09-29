import { CtaSection } from "@/components/ui/CtaSection";
import { SceneBackdrop } from "@/components/motion/SceneBackdrop";
import { ABOUT_CONTENT } from "@/content/about";
import { SITE_URL } from "@/lib/site";
import { buildPublicMetadata } from "@/lib/metadata";

const CANONICAL = `${SITE_URL}/about`;

export const metadata = buildPublicMetadata({
  title: "About AXIEONEX",
  description: "Why AXIEONEX exists and how AI and human expertise work together.",
  canonical: CANONICAL,
});

export default function AboutPage() {
  const { philosophy, principles } = ABOUT_CONTENT;
  return (
    <div data-theme="about">
      <SceneBackdrop fallbackForm="field" />

      {/* Human and system intelligence in one frame: the environment carries
          the opening statement instead of a small mark beside it. */}
      <section data-scene="field" className="relative z-10 flex min-h-screen items-center">
        <div className="ax-shell w-full pt-[clamp(96px,12vh,160px)]">
          <p className="ax-label mb-7">{ABOUT_CONTENT.eyebrow}</p>
          <div className="max-w-[20ch]">
            <h1 className="ax-display ax-hero-display m-0 text-ax-text-primary">{ABOUT_CONTENT.heroHeading}</h1>
          </div>
          <p className="ax-lede ax-measure mt-8">{ABOUT_CONTENT.heroBody}</p>
        </div>
      </section>

      <section data-reveal data-scene="cluster" className="relative z-10 ax-section">
        <div className="ax-shell grid gap-x-16 gap-y-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <h2 className="ax-headline-sm m-0 text-ax-text-primary">{ABOUT_CONTENT.problemHeading}</h2>
          <p className="ax-lede">{ABOUT_CONTENT.problemBody}</p>
        </div>
      </section>

      <section data-reveal="scale" data-scene="validate" className="relative z-10 ax-section">
        <div className="ax-shell">
          <p className="ax-label mb-6">Philosophy</p>
          <h2 className="ax-headline ax-measure m-0 mb-20 text-ax-text-primary">{ABOUT_CONTENT.philosophyHeading}</h2>
          <div className="grid gap-x-12 gap-y-14 sm:grid-cols-3">
            {philosophy.map((col) => (
              <div key={col.label} className="border-t border-ax-border-subtle pt-7">
                <div
                  className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: col.color }}
                >
                  {col.label}
                </div>
                <p className="ax-lede text-[15px]">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal data-scene="mark" className="relative z-10 ax-section">
        <div className="ax-shell">
          <p className="ax-label mb-6">Principles</p>
          <h2 className="ax-headline-sm m-0 mb-14 text-ax-text-primary">{ABOUT_CONTENT.principlesHeading}</h2>
          <dl className="m-0 flex flex-col border-t border-ax-border-subtle">
            {principles.map((p) => (
              <div
                key={p.title}
                className="grid gap-x-12 gap-y-3 border-b border-ax-border-subtle py-8 sm:grid-cols-[260px_1fr]"
              >
                <dt className="font-display text-[19px] font-normal tracking-[-0.02em] text-ax-text-primary">
                  {p.title}
                </dt>
                <dd className="ax-lede m-0 text-[15px]">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaSection scene="release" heading={ABOUT_CONTENT.ctaHeading} />
    </div>
  );
}
