import type { FaqItem } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading, Lede } from "@/components/ui/Heading";
import { Accordion } from "@/components/ui/Accordion";

export function FaqSection({
  heading,
  intro,
  items,
}: {
  heading: string;
  intro?: string;
  items: FaqItem[];
}) {
  return (
    <section className="border-b border-[var(--color-border)] py-20 sm:py-28">
      <Container className="max-w-3xl">
        <SectionHeading align="left">{heading}</SectionHeading>
        {intro ? <Lede className="mt-3">{intro}</Lede> : null}
        <div className="mt-8">
          <Accordion items={items} />
        </div>
      </Container>
    </section>
  );
}
