import type { Metadata } from "next";
import { EngineInteriorHero } from "@/components/how-we-work/EngineInteriorHero";
import { ScrollChapterSequence } from "@/components/how-we-work/ScrollChapterSequence";
import { CtaSection } from "@/components/ui/CtaSection";
import { HOW_WE_WORK_CONTENT } from "@/content/howWeWork";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/how-we-work`;

export const metadata: Metadata = {
  title: "How AXIEONEX Works",
  description: "The ten-stage operating sequence from market definition to continuous optimization.",
  alternates: { canonical: CANONICAL },
  openGraph: { title: "How AXIEONEX Works", description: "The ten-stage operating sequence from market definition to continuous optimization.", url: CANONICAL },
};

export default function HowWeWorkPage() {
  return (
    <div data-theme="how-we-work" className="bg-ax-ink-7 text-ax-text-primary">
      <EngineInteriorHero />
      <ScrollChapterSequence />
      <CtaSection heading={HOW_WE_WORK_CONTENT.ctaHeading} material="cobalt" className="bg-ax-ink-6" />
    </div>
  );
}
