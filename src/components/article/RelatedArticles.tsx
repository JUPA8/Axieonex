import { TransitionLink } from "@/components/transition/TransitionLink";
import { getRelatedArticles } from "@/content/articles";

export function RelatedArticles({ slug }: { slug: string }) {
  const related = getRelatedArticles(slug);
  if (related.length === 0) return null;
  return (
    <div>
      <div className="mb-5 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">Related insights</div>
      <div className="grid gap-6 sm:grid-cols-2">
        {related.map((article) => (
          <TransitionLink key={article.slug} href={`/insights/${article.slug}`} className="block border-t-2 pt-4" style={{ borderColor: article.color }}>
            <div className="text-[11px] font-semibold text-ax-text-muted">{article.category}</div>
            <div className="mt-2 text-base font-semibold leading-snug">{article.title}</div>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
