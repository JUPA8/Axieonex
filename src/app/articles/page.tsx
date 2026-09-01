import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { Container } from "@/components/ui/Container";
import { ARTICLES_LISTING } from "@/content/articlesListing";

export const metadata: Metadata = {
  title: "Insights & Thought Leadership | Axieonex",
  description: "Explore how Axieonex builds AI-orchestrated, human-executed revenue engines.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  return (
    <>
      <Hero heading="Insights & Thought Leadership" subheading="Explore how Axieonex builds AI-orchestrated, human-executed revenue engines." />
      <section className="py-20 sm:py-24">
        <Container className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES_LISTING.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition-colors hover:border-[var(--color-accent)]/50"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
                {card.category}
              </span>
              <h2 className="mt-2 text-lg font-bold leading-snug text-[var(--color-fg)]">{card.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-fg-muted)]">
                {card.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[var(--color-fg-subtle)]">{card.readTime}</span>
                <span className="font-semibold text-[var(--color-accent)] group-hover:underline">Read</span>
              </div>
            </Link>
          ))}
        </Container>
      </section>
    </>
  );
}
