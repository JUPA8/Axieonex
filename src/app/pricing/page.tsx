import { AssemblyHero } from "@/components/pricing/AssemblyHero";
import { EngagementConfigurator } from "@/components/pricing/EngagementConfigurator";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { FAQ } from "@/components/ui/FAQ";
import { CtaSection } from "@/components/ui/CtaSection";
import { SceneBackdrop } from "@/components/motion/SceneBackdrop";
import { PRICING_FAQ } from "@/content/pricing";
import { SITE_URL } from "@/lib/site";
import { buildPublicMetadata } from "@/lib/metadata";

const CANONICAL = `${SITE_URL}/pricing`;

export const metadata = buildPublicMetadata({
  title: "AXIEONEX Pricing and Engagement Models",
  description: "Engagement structured to your market, no fixed price list.",
  canonical: CANONICAL,
});

export default function PricingPage() {
  return (
    <div data-theme="pricing">
      <SceneBackdrop fallbackForm="cluster" />
      <AssemblyHero />

      <section data-reveal data-scene="mark" className="relative z-10 ax-section-tight">
        <div className="ax-shell ax-veil">
          <EngagementConfigurator />
        </div>
      </section>

      <section data-scene="validate" className="relative z-10 ax-section-tight">
        <div className="ax-shell ax-veil">
          <ComparisonTable />
        </div>
      </section>

      <section data-reveal="mask-left" data-scene="lanes" className="relative z-10 ax-section">
        <div className="ax-shell grid gap-x-16 gap-y-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <h2 className="ax-headline-sm m-0 text-ax-text-primary">
            Building this internally means hiring, training and managing an SDR team, plus the tooling to run them.
            An engagement with Axieonex replaces that with one accountable system and no ramp time.
          </h2>
          <p className="ax-lede">
            We do not publish comparative cost figures here. Bring your current numbers to a strategy call and we
            will show you where a coordinated system changes the equation.
          </p>
        </div>
      </section>

      <section data-scene="core" className="relative z-10 ax-section">
        <div className="ax-shell ax-veil grid gap-x-16 gap-y-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="ax-label mb-6">Pricing questions</p>
          </div>
          <FAQ items={PRICING_FAQ} heading="" />
        </div>
      </section>

      <CtaSection scene="release" heading="Let's scope your engagement." />
    </div>
  );
}
