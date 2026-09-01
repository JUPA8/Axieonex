import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Heading";
import { Card } from "@/components/ui/Card";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { DemoCtaButton } from "@/features/contact/DemoCtaButton";
import {
  PRICING_HERO,
  PRICING_PHILOSOPHY,
  PRICING_MODELS,
  PRICING_INCLUDED,
  PRICING_WHY,
  PRICING_ROI,
  PRICING_FAQS,
  PRICING_FINAL_CTA,
} from "@/content/pricing";

export const metadata: Metadata = {
  title: "Pricing | Axieonex Sales",
  description: "Transparent, value-based pricing models for AI-orchestrated revenue generation.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Hero heading={PRICING_HERO.heading} subheading={PRICING_HERO.subheading} />

      <section className="border-b border-[var(--color-border)] py-16 sm:py-20">
        <Container className="max-w-3xl text-center">
          <SectionHeading className="mb-3 text-2xl">{PRICING_PHILOSOPHY.heading}</SectionHeading>
          <p className="text-base leading-relaxed text-[var(--color-fg-muted)]">{PRICING_PHILOSOPHY.body}</p>
        </Container>
      </section>

      <section className="border-b border-[var(--color-border)] py-20 sm:py-24">
        <Container className="max-w-5xl">
          <div className="text-center">
            <SectionHeading>{PRICING_MODELS.heading}</SectionHeading>
            <p className="mt-3 text-base text-[var(--color-fg-muted)]">{PRICING_MODELS.intro}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {PRICING_MODELS.models.map((model) => (
              <Card key={model.name} className="flex flex-col">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
                  {model.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{model.subtitle}</p>
                <h3 className="mt-4 text-2xl font-bold text-[var(--color-fg)]">{model.headline}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                  {model.body}
                </p>
                <ul className="mt-5 space-y-2">
                  {model.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-[var(--color-fg-muted)]">
                      <span aria-hidden="true" className="text-[var(--color-accent)]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <DemoCtaButton className="w-full">{model.cta}</DemoCtaButton>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--color-border)] py-20 sm:py-24">
        <Container className="max-w-4xl">
          <SectionHeading className="mb-6">{PRICING_INCLUDED.heading}</SectionHeading>
          <ul className="grid gap-3 sm:grid-cols-2">
            {PRICING_INCLUDED.items.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-sm text-[var(--color-fg-muted)]"
              >
                <span aria-hidden="true" className="text-[var(--color-accent)]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-b border-[var(--color-border)] py-20 sm:py-24">
        <Container className="max-w-5xl">
          <SectionHeading className="mb-8">{PRICING_WHY.heading}</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-3">
            {PRICING_WHY.reasons.map((reason) => (
              <Card key={reason.title}>
                <h3 className="text-base font-bold text-[var(--color-fg)]">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">{reason.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--color-border)] py-20 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading className="mb-8">{PRICING_ROI.heading}</SectionHeading>
          <dl className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
            {PRICING_ROI.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-4">
                <dt className="text-sm text-[var(--color-fg-muted)]">{row.label}</dt>
                <dd className="text-sm font-bold text-[var(--color-fg)]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-center text-xs text-[var(--color-fg-subtle)]">{PRICING_ROI.footnote}</p>
        </Container>
      </section>

      <FaqSection heading="Frequently Asked Questions" items={PRICING_FAQS} />

      <CtaSection
        heading={PRICING_FINAL_CTA.heading}
        body={PRICING_FINAL_CTA.body}
        note={PRICING_FINAL_CTA.note}
        primaryCta={PRICING_FINAL_CTA.cta}
      />
    </>
  );
}
