import { SculpturalMarkReveal } from "@/components/about/SculpturalMarkReveal";
import { AmbientField } from "@/components/motion/AmbientField";
import { CtaSection } from "@/components/ui/CtaSection";
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
      {/* Distributed intelligence: the field sits behind the opening
          statement rather than beside it, so the page reads as one surface. */}
      <section className="relative overflow-hidden">
        <AmbientField className="opacity-70" intensity={0.5} markScale={0.46} />
        <div className="ax-shell relative z-10 grid items-center gap-x-16 gap-y-12 pb-[clamp(64px,9vw,130px)] pt-[clamp(120px,16vh,200px)] lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="ax-label mb-7">{ABOUT_CONTENT.eyebrow}</p>
            <h1 className="ax-headline m-0 text-ax-text-primary">{ABOUT_CONTENT.heroHeading}</h1>
            <p className="ax-lede ax-measure mt-9">{ABOUT_CONTENT.heroBody}</p>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <SculpturalMarkReveal />
          </div>
        </div>
      </section>

      <section data-reveal className="ax-section relative">
        <div className="ax-shell grid gap-x-16 gap-y-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <h2 className="ax-headline-sm m-0 text-ax-text-primary">{ABOUT_CONTENT.problemHeading}</h2>
          <p className="ax-lede">{ABOUT_CONTENT.problemBody}</p>
        </div>
      </section>

      <section data-reveal="scale" className="ax-section relative">
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

      <section data-reveal className="ax-section relative">
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

      <CtaSection heading={ABOUT_CONTENT.ctaHeading} />
    </div>
  );
}
