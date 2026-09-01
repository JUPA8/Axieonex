import type { ArticleContent } from "@/types/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/Heading";

export function ArticleBody({ article }: { article: ArticleContent }) {
  return (
    <article className="border-b border-[var(--color-border)] py-16 sm:py-24">
      <Container className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
          <span>{article.category}</span>
          <span aria-hidden="true">•</span>
          <span className="text-[var(--color-fg-subtle)]">{article.readTime}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-[var(--color-fg)] sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base text-[var(--color-fg-muted)]">{article.description}</p>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-[var(--color-fg-muted)]">
          {article.leadParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {article.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <SectionHeading as="h2" align="left" className="mb-2 text-xl sm:text-2xl">
              {section.heading}
            </SectionHeading>
            <div className="space-y-4 text-base leading-relaxed text-[var(--color-fg-muted)]">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </Container>
    </article>
  );
}
