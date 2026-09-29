import { ServicesHubInteractive } from "@/components/services/ServicesHubInteractive";
import { AmbientField } from "@/components/motion/AmbientField";
import { CtaSection } from "@/components/ui/CtaSection";
import { SITE_URL } from "@/lib/site";
import { buildPublicMetadata } from "@/lib/metadata";

const CANONICAL = `${SITE_URL}/services`;

export const metadata = buildPublicMetadata({
  title: "AXIEONEX Services",
  description: "Seven connected revenue capabilities in one system.",
  canonical: CANONICAL,
});

export default function ServicesPage() {
  return (
    <div data-theme="services">
      {/* Signal channels separating and recombining behind the statement. */}
      <section className="relative overflow-hidden">
        <AmbientField className="opacity-60" intensity={0.44} markScale={0.42} />
        <div className="ax-shell relative z-10 pb-[clamp(48px,7vw,96px)] pt-[clamp(120px,16vh,200px)]">
          <p className="ax-label mb-7">Connected capabilities</p>
          <h1 className="ax-headline ax-measure-tight m-0 text-ax-text-primary">
            Seven capabilities. One revenue engine.
          </h1>
          <p className="ax-lede ax-measure mt-9">
            Every service below is a module inside the same coordinated system, not a menu of separate purchases.
            Select one to see how it connects to the rest.
          </p>
        </div>
      </section>

      <section className="ax-section-tight">
        <div className="ax-shell">
          <ServicesHubInteractive />
        </div>
      </section>

      {/*
        The approved Services hub prototype has no distinct final-CTA copy of
        its own (only the per-service panel CTAs above), so this reuses the
        homepage's approved closing line verbatim rather than inventing new
        marketing copy for this page.
      */}
      <CtaSection heading="Let's build your revenue engine." />
    </div>
  );
}
