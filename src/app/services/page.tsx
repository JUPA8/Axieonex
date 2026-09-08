import type { Metadata } from "next";
import { ServicesHubInteractive } from "@/components/services/ServicesHubInteractive";
import { CtaSection } from "@/components/ui/CtaSection";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/services`;

export const metadata: Metadata = {
  title: "AXIEONEX Services",
  description: "Seven connected revenue capabilities in one system.",
  alternates: { canonical: CANONICAL },
  openGraph: { title: "AXIEONEX Services", description: "Seven connected revenue capabilities in one system.", url: CANONICAL },
};

export default function ServicesPage() {
  return (
    <div data-theme="services" className="bg-ax-ink-0 text-ax-text-primary">
      <section className="px-5 pb-16 pt-28 text-center sm:px-10 sm:pt-36">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-6 text-[13px] font-semibold text-ax-blue">Connected capabilities</div>
          <h1 className="mb-6 text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">
            Seven capabilities. One revenue engine.
          </h1>
          <p className="mx-auto max-w-[54ch] text-base leading-relaxed text-ax-text-muted">
            Every service below is a module inside the same coordinated system, not a menu of separate purchases.
            Select one to see how it connects to the rest.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-10">
        <div className="mx-auto max-w-[1160px]">
          <ServicesHubInteractive />
        </div>
      </section>

      {/*
        The approved Services hub prototype has no distinct final-CTA copy of
        its own (only the per-service panel CTAs above), so this reuses the
        homepage's approved closing line verbatim rather than inventing new
        marketing copy for this page.
      */}
      <CtaSection heading="Let's build your revenue engine." material="cobalt" className="bg-ax-ink-1" />
    </div>
  );
}
