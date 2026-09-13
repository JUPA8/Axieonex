import type { Metadata } from "next";
import { HeroSignalReveal } from "@/components/home/HeroSignalReveal";
import { EngineFlow } from "@/components/home/EngineFlow";
import { EngineDiagram } from "@/components/home/EngineDiagram";
import { ServicesList } from "@/components/home/ServicesList";
import { EngagementSteps } from "@/components/home/EngagementSteps";
import { ResponsibilitySplit } from "@/components/home/ResponsibilitySplit";
import { InsightsPreview } from "@/components/home/InsightsPreview";
import { FAQ } from "@/components/ui/FAQ";
import { CtaSection } from "@/components/ui/CtaSection";
import { HOME_FAQ } from "@/content/homeFaq";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "AXIEONEX | AI-Orchestrated, Human-Executed Revenue Systems",
  description: "We build revenue pipelines, not just meetings. AI detects signals, humans qualify conversations.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "AXIEONEX | AI-Orchestrated, Human-Executed Revenue Systems",
    description: "We build revenue pipelines, not just meetings. AI detects signals, humans qualify conversations.",
    url: SITE_URL,
    type: "website",
  },
};

// The page is otherwise fully static; only the Insights preview section
// reads from the database (Phase 2, admin-editable articles). Revalidating
// every 5 minutes keeps the marketing page's performance/caching mostly
// intact while still surfacing newly published or unpublished articles
// without requiring a full redeploy.
export const revalidate = 300;

export default function HomePage() {
  return (
    <div data-theme="home">
      <HeroSignalReveal />

      <section data-reveal="mask-left" className="relative bg-ax-pearl-1 px-5 py-24 text-ax-text-primary-on-light sm:px-10 sm:py-32">
        <div className="mx-auto max-w-[1000px]">
          <div className="mb-5.5 text-[13px] font-semibold text-[#6E5DD8]">The problem</div>
          <p className="m-0 font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.35] tracking-tight">
            Most outbound fails from <em className="font-normal">disconnected tools</em>, unqualified lists run through
            generic automation, and the months of hiring and ramp before an internal SDR team produces anything.{" "}
            <em className="font-normal">Activity without accountable pipeline.</em>
          </p>
        </div>
      </section>

      <EngineFlow />
      <EngineDiagram />

      <section data-reveal="mask-right" className="relative bg-ax-pearl-1 px-5 py-24 text-center text-ax-text-primary-on-light sm:px-10">
        <div className="mx-auto max-w-[900px]">
          <p className="m-0 font-display text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.4] tracking-tight">
            Predictable pipeline. No SDR hiring burden. Consistent, qualified conversations. Full operational control,
            without sacrificing brand quality.
          </p>
        </div>
      </section>

      <ServicesList />
      <EngagementSteps />
      <ResponsibilitySplit />
      <InsightsPreview />

      <section className="relative bg-ax-ink-0 px-5 py-28 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-[760px]">
          <h2 data-reveal className="mb-11 text-[clamp(26px,3.2vw,36px)] font-bold tracking-tight">
            Questions revenue leaders ask
          </h2>
          <div data-reveal>
            <FAQ items={HOME_FAQ} heading="" />
          </div>
        </div>
      </section>

      <CtaSection
        heading="Let's build your revenue engine."
        body="Thirty minutes to map your market, your channels, and what a qualified conversation should look like for you."
        className="bg-ax-ink-1"
      />
    </div>
  );
}
