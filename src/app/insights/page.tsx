import { InsightsInteractive } from "@/components/insights/InsightsInteractive";
import { CtaSection } from "@/components/ui/CtaSection";
import { getPublishedArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";
import { buildPublicMetadata } from "@/lib/metadata";

const CANONICAL = `${SITE_URL}/insights`;

export const metadata = buildPublicMetadata({
  title: "Insights | AXIEONEX",
  description: "Research and perspective on AI-orchestrated revenue systems.",
  canonical: CANONICAL,
});

// Content is admin-editable (Phase 2: DB-backed via /admin/articles), so this
// route must not be frozen at build time the way purely static marketing
// pages are.
export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  let unavailable = false;
  try {
    articles = await getPublishedArticles();
  } catch {
    console.error("[insights] Failed to load articles from the database.");
    unavailable = true;
  }

  return (
    <div data-theme="insights">
      <section className="relative">
        <div className="ax-shell pb-[clamp(48px,7vw,96px)] pt-[clamp(120px,16vh,200px)]">
          <p className="ax-label ax-label-violet mb-7">Insights</p>
          <h1 className="ax-headline ax-measure-tight m-0 text-ax-text-primary">How revenue systems actually work.</h1>
          <p className="ax-lede ax-measure mt-9">
            Research and operating notes on AI orchestration, human execution and predictable pipeline, written for
            revenue leaders.
          </p>
        </div>
      </section>

      <section className="pb-[clamp(72px,10vw,140px)]">
        <div className="ax-shell">
          {unavailable ? (
            <div role="alert" className="border-t border-ax-border-subtle py-20">
              <h2 className="ax-headline-sm mb-4 text-ax-text-primary">Insights are temporarily unavailable.</h2>
              <p className="ax-lede">Please check back shortly.</p>
            </div>
          ) : (
            <InsightsInteractive articles={articles} />
          )}
        </div>
      </section>

      <CtaSection heading="See it applied to your pipeline." />
    </div>
  );
}
