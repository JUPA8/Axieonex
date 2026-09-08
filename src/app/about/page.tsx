import type { Metadata } from "next";
import { SculpturalMarkReveal } from "@/components/about/SculpturalMarkReveal";
import { CtaSection } from "@/components/ui/CtaSection";
import { ABOUT_CONTENT } from "@/content/about";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/about`;

export const metadata: Metadata = {
  title: "About AXIEONEX",
  description: "Why AXIEONEX exists and how AI and human expertise work together.",
  alternates: { canonical: CANONICAL },
  openGraph: { title: "About AXIEONEX", description: "Why AXIEONEX exists and how AI and human expertise work together.", url: CANONICAL },
};

export default function AboutPage() {
  const { philosophy, principles } = ABOUT_CONTENT;
  return (
    <div data-theme="about" className="bg-ax-pearl-0 text-ax-text-primary-on-light">
      <section className="px-5 pb-20 pt-28 text-center sm:px-10 sm:pt-36">
        <div className="mx-auto max-w-[640px]">
          <div className="mb-6 text-[13px] font-semibold text-[#6E5DD8]">{ABOUT_CONTENT.eyebrow}</div>
          <h1 className="mb-7 text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">
            {ABOUT_CONTENT.heroHeading}
          </h1>
          <p className="mx-auto max-w-[52ch] text-base leading-relaxed text-ax-text-muted-on-light">{ABOUT_CONTENT.heroBody}</p>
          <div className="mt-12">
            <SculpturalMarkReveal />
          </div>
        </div>
      </section>

      <section data-reveal className="border-t border-black/8 px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-[720px]">
          <h2 className="mb-5 text-[length:var(--ax-fs-h2-fluid)] font-bold tracking-tight">{ABOUT_CONTENT.problemHeading}</h2>
          <p className="text-base leading-relaxed text-ax-text-muted-on-light">{ABOUT_CONTENT.problemBody}</p>
        </div>
      </section>

      <section data-reveal="scale" className="border-t border-black/8 px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="mb-12 text-[length:var(--ax-fs-h2-fluid)] font-bold tracking-tight">{ABOUT_CONTENT.philosophyHeading}</h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {philosophy.map((col) => (
              <div key={col.label}>
                <div className="mb-3 text-[13px] font-semibold" style={{ color: col.color }}>
                  {col.label}
                </div>
                <p className="text-[15px] leading-relaxed text-ax-text-muted-on-light">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal className="border-t border-black/8 px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-[820px]">
          <h2 className="mb-10 text-[length:var(--ax-fs-h2-fluid)] font-bold tracking-tight">{ABOUT_CONTENT.principlesHeading}</h2>
          <dl className="flex flex-col">
            {principles.map((p, i) => (
              <div key={p.title} className={`grid gap-2 border-t border-black/8 py-6 sm:grid-cols-[220px_1fr] sm:gap-8 ${i === principles.length - 1 ? "border-b" : ""}`}>
                <dt className="font-display text-lg font-bold">{p.title}</dt>
                <dd className="m-0 text-[15px] leading-relaxed text-ax-text-muted-on-light">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaSection heading={ABOUT_CONTENT.ctaHeading} material="pearl" className="bg-[#1B1B1E] text-ax-text-primary" />
    </div>
  );
}
