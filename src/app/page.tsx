import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ArticlesPreview } from "@/components/sections/ArticlesPreview";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { DemoCtaButton } from "@/features/contact/DemoCtaButton";
import { Button } from "@/components/ui/Button";
import { HOME_HERO, HOME_FAQS, HOME_FINAL_CTA } from "@/content/homepage";

export const metadata: Metadata = {
  title: "AXIEONEX | AI Appointment Setting & Lead Generation",
  description:
    "We Build Revenue Pipelines — Not Just Meetings. AI-powered outbound systems and human expertise designed for predictable, scalable growth.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero
        eyebrow={HOME_HERO.eyebrow}
        heading={HOME_HERO.heading}
        subheading={HOME_HERO.subheading}
        actions={
          <>
            <DemoCtaButton>{HOME_HERO.primaryCta}</DemoCtaButton>
            <Button href={HOME_HERO.secondaryHref} variant="outline">
              {HOME_HERO.secondaryCta}
            </Button>
          </>
        }
      />
      <HowItWorks />
      <ArticlesPreview />
      <FaqSection
        heading="Frequently Asked Questions"
        intro="Answers to the most common questions founders and revenue leaders ask before partnering with Axieonex."
        items={HOME_FAQS}
      />
      <CtaSection
        heading={HOME_FINAL_CTA.heading}
        body={HOME_FINAL_CTA.body}
        primaryCta={HOME_FINAL_CTA.primaryCta}
        secondaryCta={HOME_FINAL_CTA.secondaryCta}
        secondaryHref={HOME_FINAL_CTA.secondaryHref}
      />
    </>
  );
}
