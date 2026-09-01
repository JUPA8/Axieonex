import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { DemoCtaButton } from "@/features/contact/DemoCtaButton";

export function CtaSection({
  heading,
  body,
  note,
  primaryCta = "Get a Free Demo",
  secondaryCta,
  secondaryHref,
}: {
  heading: string;
  body: string;
  note?: string;
  primaryCta?: string;
  secondaryCta?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">{heading}</h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-fg-muted)]">{body}</p>
        {note ? <p className="mt-2 text-sm text-[var(--color-fg-subtle)]">{note}</p> : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <DemoCtaButton>{primaryCta}</DemoCtaButton>
          {secondaryCta && secondaryHref ? (
            <Link
              href={secondaryHref}
              className="text-sm font-semibold text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            >
              {secondaryCta}
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
