import { Container } from "@/components/ui/Container";
import { SectionHeading, Lede } from "@/components/ui/Heading";
import { Card } from "@/components/ui/Card";
import { DemoCtaButton } from "@/features/contact/DemoCtaButton";
import { HOME_HOW_IT_WORKS } from "@/content/homepage";

const ICONS = ["◈", "➤", "◎"];

export function HowItWorks() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-raised)] py-20 sm:py-28">
      <Container className="max-w-4xl text-center">
        <SectionHeading>{HOME_HOW_IT_WORKS.heading}</SectionHeading>
        <Lede className="mx-auto mt-4 max-w-2xl">{HOME_HOW_IT_WORKS.intro}</Lede>

        <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
          {HOME_HOW_IT_WORKS.pillars.map((pillar, i) => (
            <Card key={pillar.title}>
              <span
                aria-hidden="true"
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-lg text-[var(--color-accent)]"
              >
                {ICONS[i]}
              </span>
              <h3 className="text-base font-bold text-[var(--color-fg)]">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-fg-muted)]">{pillar.description}</p>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-sm leading-relaxed text-[var(--color-fg-muted)]">
          {HOME_HOW_IT_WORKS.closing}
        </p>
        <div className="mt-8">
          <DemoCtaButton>Get a Free Demo</DemoCtaButton>
        </div>
      </Container>
    </section>
  );
}
