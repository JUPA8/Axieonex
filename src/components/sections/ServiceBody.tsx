import type { ServiceContent } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Heading";
import { Card, Badge } from "@/components/ui/Card";
import { DemoCtaButton } from "@/features/contact/DemoCtaButton";

export function ServiceBody({ service }: { service: ServiceContent }) {
  return (
    <>
      <section className="border-b border-[var(--color-border)] py-20 sm:py-24">
        <Container className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold leading-tight text-[var(--color-fg)] sm:text-5xl">
            {service.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-fg-muted)]">
            {service.description}
          </p>
          <div className="mt-8">
            <DemoCtaButton>Book a Strategy Call</DemoCtaButton>
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--color-border)] py-20 sm:py-24">
        <Container className="max-w-4xl">
          <SectionHeading align="left" className="mb-6">
            What We Do
          </SectionHeading>
          <ul className="grid gap-4 sm:grid-cols-2">
            {service.whatWeDo.map((item) => (
              <li key={item} className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
                <span aria-hidden="true" className="text-[var(--color-accent)]">✓</span>
                <span className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-b border-[var(--color-border)] py-20 sm:py-24">
        <Container className="grid max-w-4xl gap-6 sm:grid-cols-2">
          <Card>
            <SectionHeading as="h2" align="left" className="mb-3 text-xl">
              {service.whyThisWorksHeading}
            </SectionHeading>
            <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{service.whyThisWorks}</p>
          </Card>
          <Card>
            <SectionHeading as="h2" align="left" className="mb-3 text-xl">
              {service.whoThisIsForHeading}
            </SectionHeading>
            <p className="text-sm leading-relaxed text-[var(--color-fg-muted)]">{service.whoThisIsFor}</p>
          </Card>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="max-w-2xl text-center">
          {service.badge ? <Badge className="mb-5">{service.badge}</Badge> : null}
          <h2 className="text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">{service.ctaHeading}</h2>
          <div className="mt-7">
            <DemoCtaButton>{service.ctaButton}</DemoCtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
