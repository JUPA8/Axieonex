import type { Metadata } from "next";
import { InsightsInteractive } from "@/components/insights/InsightsInteractive";
import { CtaSection } from "@/components/ui/CtaSection";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/insights`;

export const metadata: Metadata = {
  title: "Insights | AXIEONEX",
  description: "Research and perspective on AI-orchestrated revenue systems.",
  alternates: { canonical: CANONICAL },
  openGraph: { title: "Insights | AXIEONEX", description: "Research and perspective on AI-orchestrated revenue systems.", url: CANONICAL },
};

export default function InsightsPage() {
  return (
    <div data-theme="insights" className="bg-ax-ink-5 text-ax-text-primary">
      <section className="px-5 pb-16 pt-28 text-center sm:px-10 sm:pt-36">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-6 text-[13px] font-semibold text-ax-violet">Insights</div>
          <h1 className="mb-6 text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">
            How revenue systems actually work.
          </h1>
          <p className="mx-auto max-w-[54ch] text-base leading-relaxed text-ax-text-muted">
            Research and operating notes on AI orchestration, human execution and predictable pipeline, written for
            revenue leaders.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-10">
        <div className="mx-auto max-w-[1160px]">
          <InsightsInteractive />
        </div>
      </section>

      <CtaSection heading="See it applied to your pipeline." material="spectral" className="bg-ax-ink-6" />
    </div>
  );
}
