import type { Metadata } from "next";
import { ConvergenceHero } from "@/components/contact/ConvergenceHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/contact`;

export const metadata: Metadata = {
  title: "Contact AXIEONEX",
  description: "Reach AXIEONEX for general, service, partnership, or media enquiries.",
  alternates: { canonical: CANONICAL },
  openGraph: { title: "Contact AXIEONEX", description: "Reach AXIEONEX for general, service, partnership, or media enquiries.", url: CANONICAL },
};

export default function ContactPage() {
  return (
    <div data-theme="contact" className="bg-ax-ink-0 text-ax-text-primary">
      <section className="px-5 pb-12 pt-28 text-center sm:px-10 sm:pt-36">
        <div className="mx-auto max-w-[620px]">
          <div className="mb-6 text-[13px] font-semibold text-ax-cyan-alt">Contact</div>
          <h1 className="mb-6 text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">
            One channel, routed to the right people.
          </h1>
          <p className="mx-auto max-w-[48ch] text-base leading-relaxed text-ax-text-muted">
            General, service, partnership, media or existing-client enquiries all start here.
          </p>
          <div className="mt-10">
            <ConvergenceHero />
          </div>
        </div>
      </section>

      <section className="px-5 pb-28 sm:px-10">
        <div className="mx-auto max-w-[560px]">
          <ContactForm turnstileSiteKey={process.env.CAPTCHA_SITE_KEY} />
        </div>
      </section>
    </div>
  );
}
