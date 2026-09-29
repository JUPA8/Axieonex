import { TransitionLink } from "@/components/transition/TransitionLink";
import { getPublishedArticles } from "@/lib/articles";

export async function InsightsPreview() {
  const articles = await getPublishedArticles().catch(() => {
    console.error("[InsightsPreview] Failed to load articles from the database.");
    return [];
  });

  if (articles.length === 0) return null;

  return (
    <section id="articles" data-scene="field" className="ax-section relative z-10">
      <div className="ax-shell ax-veil">
        <div data-reveal className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="ax-label mb-6">Insights</p>
            <h2 className="ax-headline m-0 text-ax-text-primary">Perspective on revenue systems.</h2>
          </div>
          <TransitionLink
            href="/insights"
            className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ax-text-muted transition-colors hover:text-ax-text-primary"
          >
            All articles
          </TransitionLink>
        </div>
        <div data-reveal="scale" className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 6).map((article) => (
            <TransitionLink
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="group block border-t border-ax-border-subtle pt-6"
            >
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: article.color }}
              >
                {article.category}
              </div>
              <div className="mt-4 text-[19px] font-normal leading-snug tracking-[-0.02em] text-ax-text-primary transition-colors group-hover:text-ax-violet">
                {article.title}
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
