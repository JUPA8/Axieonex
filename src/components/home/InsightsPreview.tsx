import { TransitionLink } from "@/components/transition/TransitionLink";
import { ARTICLES } from "@/content/articles";

export function InsightsPreview() {
  return (
    <section id="articles" className="relative bg-ax-pearl-1 px-5 py-28 text-ax-text-primary-on-light sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[1160px]">
        <div data-reveal className="mb-11 flex flex-wrap items-baseline justify-between gap-3.5">
          <h2 className="text-[clamp(26px,3.2vw,36px)] font-bold tracking-tight">Insights</h2>
          <TransitionLink href="/insights" className="text-sm text-ax-text-muted-on-light hover:text-ax-text-primary-on-light">
            All articles →
          </TransitionLink>
        </div>
        <div data-reveal="scale" className="grid gap-9" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {ARTICLES.map((article) => (
            <TransitionLink
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="block border-t-2 pt-4.5"
              style={{ borderColor: article.color }}
            >
              <div className="text-[11px] font-semibold text-[#8A8E9E]">{article.category}</div>
              <div className="mt-2.5 text-lg font-semibold leading-snug">{article.title}</div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
