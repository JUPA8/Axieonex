import { EngineInteriorHero } from "@/components/how-we-work/EngineInteriorHero";
import { ScrollChapterSequence } from "@/components/how-we-work/ScrollChapterSequence";
import { CtaSection } from "@/components/ui/CtaSection";
import { HOW_WE_WORK_CONTENT } from "@/content/howWeWork";
import { SITE_URL } from "@/lib/site";
import { buildPublicMetadata } from "@/lib/metadata";

const CANONICAL = `${SITE_URL}/how-we-work`;

export const metadata = buildPublicMetadata({
  title: "How AXIEONEX Works",
  description: "The ten-stage operating sequence from market definition to continuous optimization.",
  canonical: CANONICAL,
});

export default function HowWeWorkPage() {
  return (
    <div data-theme="how-we-work">
      <EngineInteriorHero />
      <ScrollChapterSequence />
      <CtaSection heading={HOW_WE_WORK_CONTENT.ctaHeading} />
    </div>
  );
}
