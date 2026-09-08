import { ReadingProgress } from "@/components/article/ReadingProgress";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CtaSection } from "@/components/ui/CtaSection";
import type { Article } from "@/types/content";

export function ArticleTemplate({ article }: { article: Article }) {
  return (
    <div data-theme="article" className="bg-ax-ink-5 text-ax-text-primary">
      <ReadingProgress />
      <article className="px-5 pb-20 pt-28 sm:px-10 sm:pt-36">
        <div className="mx-auto max-w-[720px]">
          <TransitionLink href="/insights" className="mb-8 inline-block text-sm text-ax-text-muted hover:text-ax-text-primary">
            ← All insights
          </TransitionLink>
          <div className="mb-4 text-[11px] font-semibold" style={{ color: article.color }}>
            {article.category}
          </div>
          <h1 className="mb-4 font-display text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">
            {article.title}
          </h1>
          <div className="mb-10 text-sm text-ax-text-muted">Axieonex editorial team</div>

          <div className="font-editorial text-lg leading-relaxed text-ax-text-body">
            <p className="mb-8">{article.intro}</p>
            <h2 className="mb-3 font-display text-xl font-bold text-ax-text-primary">{article.h2a}</h2>
            <p className="mb-8">{article.bodyA}</p>
            <h2 className="mb-3 font-display text-xl font-bold text-ax-text-primary">{article.h2b}</h2>
            <p className="mb-8">{article.bodyB}</p>
            <h2 className="mb-3 font-display text-xl font-bold text-ax-text-primary">What this means for your pipeline</h2>
            <p className="mb-8">{article.closing}</p>
          </div>

          <div className="mt-16 border-t border-ax-border-subtle pt-12">
            <RelatedArticles slug={article.slug} />
          </div>
        </div>
      </article>
      <CtaSection heading="Let's build your revenue engine." material="spectral" className="bg-ax-ink-6" />
    </div>
  );
}
