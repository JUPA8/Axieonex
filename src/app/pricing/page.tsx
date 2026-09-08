import type { Metadata } from "next";
import { AssemblyHero } from "@/components/pricing/AssemblyHero";
import { EngagementConfigurator } from "@/components/pricing/EngagementConfigurator";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { FAQ } from "@/components/ui/FAQ";
import { CtaSection } from "@/components/ui/CtaSection";
import { PRICING_FAQ } from "@/content/pricing";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/pricing`;

export const metadata: Metadata = {
  title: "AXIEONEX Pricing and Engagement Models",
  description: "Engagement structured to your market, no fixed price list.",
  alternates: { canonical: CANONICAL },
  openGraph: { title: "AXIEONEX Pricing and Engagement Models", description: "Engagement structured to your market, no fixed price list.", url: CANONICAL },
};

export default function PricingPage() {
  return (
    <div data-theme="pricing" className="bg-ax-ink-3 text-ax-text-primary">
      <AssemblyHero />

      <section data-reveal className="px-5 pb-20 sm:px-10">
        <div className="mx-auto max-w-[1100px]">
          <EngagementConfigurator />
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-[1000px]">
          <ComparisonTable />
        </div>
      </section>

      <section data-reveal="mask-left" className="border-t border-white/8 bg-black/20 px-5 py-20 text-center sm:px-10">
        <div className="mx-auto max-w-[820px]">
          <h2 className="mb-6 text-[clamp(24px,3vw,32px)] font-bold leading-snug tracking-tight">
            Building this internally means hiring, training and managing an SDR team, plus the tooling to run them.
            An engagement with Axieonex replaces that with one accountable system and no ramp time.
          </h2>
          <p className="mx-auto max-w-[60ch] text-base leading-relaxed text-ax-text-muted">
            We do not publish comparative cost figures here. Bring your current numbers to a strategy call and we
            will show you where a coordinated system changes the equation.
          </p>
        </div>
      </section>

      <section className="border-t border-white/8 px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-[760px]">
          <FAQ items={PRICING_FAQ} heading="Pricing questions" />
        </div>
      </section>

      <CtaSection heading="Let's scope your engagement." material="platinum" className="border-t border-white/8" />
    </div>
  );
}
