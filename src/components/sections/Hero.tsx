import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Heading";

export function Hero({
  eyebrow,
  heading,
  subheading,
  actions,
}: {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--color-border)] py-20 sm:py-28">
      <Container className="max-w-3xl text-center">
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
        <h1 className="text-4xl font-bold leading-tight text-[var(--color-fg)] sm:text-5xl">{heading}</h1>
        {subheading ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-fg-muted)]">
            {subheading}
          </p>
        ) : null}
        {actions ? <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
      </Container>
    </section>
  );
}
