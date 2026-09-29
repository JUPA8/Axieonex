import { ReadingProgress } from "@/components/article/ReadingProgress";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { CtaSection } from "@/components/ui/CtaSection";
import type { Article } from "@/types/content";

export function ArticleTemplate({ article }: { article: Article }) {
  return (
    <div data-theme="article" className="bg-ax-ink-5 text-ax-text-primary">
      <ReadingProgress />
      <article className="pb-[clamp(64px,9vw,120px)] pt-[clamp(120px,15vh,180px)]">
        <div className="ax-shell-narrow max-w-[760px]">
          <TransitionLink href="/insights" className="mb-12 inline-block text-[12px] font-semibold uppercase tracking-[0.1em] text-ax-text-muted transition-colors hover:text-ax-text-primary">
            ← All insights
          </TransitionLink>
          <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: article.color }}>
            {article.category}
          </div>
          <h1 className="ax-headline m-0 mb-8 text-ax-text-primary">{article.title}</h1>
          <div className="mb-14 text-[12px] uppercase tracking-[0.12em] text-ax-text-muted">
            Axieonex editorial team
          </div>

          <div className="font-editorial text-[19px] leading-[1.75] text-ax-text-body">
            <p className="mb-9">{article.intro}</p>
            <h2 className="mb-5 mt-14 font-display text-[26px] font-normal tracking-[-0.025em] text-ax-text-primary">{article.h2a}</h2>
            <p className="mb-9">{article.bodyA}</p>
            <h2 className="mb-5 mt-14 font-display text-[26px] font-normal tracking-[-0.025em] text-ax-text-primary">{article.h2b}</h2>
            <p className="mb-9">{article.bodyB}</p>
            <h2 className="mb-5 mt-14 font-display text-[26px] font-normal tracking-[-0.025em] text-ax-text-primary">What this means for your pipeline</h2>
            <p className="mb-9">{article.closing}</p>
          </div>

          <div className="mt-24 border-t border-ax-border-subtle pt-14">
            <RelatedArticles slug={article.slug} />
          </div>
        </div>
      </article>
      <CtaSection heading="Let's build your revenue engine." />
    </div>
  );
}
