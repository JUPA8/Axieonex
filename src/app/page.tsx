import { HeroSignalReveal } from "@/components/home/HeroSignalReveal";
import { EngineFlow } from "@/components/home/EngineFlow";
import { StickyNarrative } from "@/components/home/StickyNarrative";
import { ServicesList } from "@/components/home/ServicesList";
import { EngagementSteps } from "@/components/home/EngagementSteps";
import { ResponsibilitySplit } from "@/components/home/ResponsibilitySplit";
import { InsightsPreview } from "@/components/home/InsightsPreview";
import { FAQ } from "@/components/ui/FAQ";
import { CtaSection } from "@/components/ui/CtaSection";
import { HOME_FAQ } from "@/content/homeFaq";
import { SITE_URL } from "@/lib/site";
import { buildOrganizationSchema } from "@/lib/structuredData";
import { JsonLd } from "@/components/seo/JsonLd";
import { SceneBackdrop } from "@/components/motion/SceneBackdrop";
import { buildPublicMetadata } from "@/lib/metadata";

export const metadata = buildPublicMetadata({
  title: "AXIEONEX | AI-Orchestrated, Human-Executed Revenue Systems",
  description: "We build revenue pipelines, not just meetings. AI detects signals, humans qualify conversations.",
  canonical: SITE_URL,
});

// The page is otherwise fully static; only the Insights preview section
// reads from the database (Phase 2, admin-editable articles). Revalidating
// every 5 minutes keeps the marketing page's performance/caching mostly
// intact while still surfacing newly published or unpublished articles
// without requiring a full redeploy.
export const revalidate = 300;

export default function HomePage() {
  return (
    <div data-theme="home">
      <JsonLd data={buildOrganizationSchema()} />
      <SceneBackdrop fallbackForm="field" />
      <HeroSignalReveal />

      <section data-scene="scan" className="relative z-10 flex min-h-screen items-center">
        <div className="ax-shell">
          <p className="ax-label mb-8">The problem</p>
          <p className="ax-headline max-w-[24ch] m-0 text-ax-text-primary">
            Most outbound fails from <em className="font-extralight not-italic text-ax-text-muted">disconnected tools</em>,
            unqualified lists run through generic automation, and the months of hiring and ramp before an internal SDR
            team produces anything.{" "}
            <em className="font-extralight not-italic text-ax-text-muted">Activity without accountable pipeline.</em>
          </p>
        </div>
      </section>

      <EngineFlow />
      <StickyNarrative />

      {/* The pin releases on the qualified-opportunity core; this section
          holds that climax for one more viewport instead of cutting away. */}
      <section data-scene="core" className="relative z-10 flex min-h-screen items-center">
        <div className="ax-shell">
          <p className="ax-label mb-8">The outcome</p>
          <p className="ax-headline max-w-[22ch] m-0 text-ax-text-primary">
            Predictable pipeline. No SDR hiring burden. Consistent, qualified conversations. Full operational control,
            without sacrificing brand quality.
          </p>
        </div>
      </section>

      <ServicesList />
      <EngagementSteps />
      <ResponsibilitySplit />
      <InsightsPreview />

      <section data-scene="core" className="ax-section relative z-10">
        <div className="ax-shell grid gap-x-16 gap-y-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div data-reveal>
            <p className="ax-label mb-6">Questions</p>
            <h2 className="ax-headline-sm m-0 text-ax-text-primary">Questions revenue leaders ask</h2>
          </div>
          <div data-reveal className="ax-veil">
            <FAQ items={HOME_FAQ} heading="" />
          </div>
        </div>
      </section>

      <CtaSection
        scene="release"
        heading="Let's build your revenue engine."
        body="Thirty minutes to map your market, your channels, and what a qualified conversation should look like for you."
      />
    </div>
  );
}
