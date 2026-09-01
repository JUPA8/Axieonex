import Link from "next/link";
import type { ArticleContent } from "@/types/content";

export function ArticleCard({ article }: { article: ArticleContent }) {
  return (
    <Link
      href={article.href}
      className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition-colors hover:border-[var(--color-accent)]/50"
    >
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
        {article.category}
      </span>
      <h3 className="mt-2 text-lg font-bold leading-snug text-[var(--color-fg)]">{article.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-fg-muted)]">
        {article.description}
      </p>
      <span className="mt-4 text-sm font-semibold text-[var(--color-accent)] group-hover:underline">
        Read more →
      </span>
    </Link>
  );
}
