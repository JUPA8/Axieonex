import type { LegalContent } from "@/types/content";
import { Container } from "@/components/ui/Container";

export function LegalBody({ legal }: { legal: LegalContent }) {
  return (
    <article className="py-20 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="text-4xl font-bold text-[var(--color-fg)]">{legal.title}</h1>
        <p className="mt-3 text-base text-[var(--color-fg-muted)]">{legal.tagline}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">
          {legal.lastUpdated}
        </p>

        <div className="mt-10 space-y-8">
          {legal.sections.map((section) => (
            <section key={section.number}>
              <h2 className="text-xl font-bold text-[var(--color-fg)]">
                {section.number}. {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}
