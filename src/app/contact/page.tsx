import { ContactForm } from "@/components/contact/ContactForm";
import { SceneBackdrop } from "@/components/motion/SceneBackdrop";
import { SITE_URL } from "@/lib/site";
import { buildPublicMetadata } from "@/lib/metadata";

const CANONICAL = `${SITE_URL}/contact`;

export const metadata = buildPublicMetadata({
  title: "Contact AXIEONEX",
  description: "Reach AXIEONEX for general, service, partnership, or media enquiries.",
  canonical: CANONICAL,
});

export default function ContactPage() {
  return (
    <div data-theme="contact">
      <SceneBackdrop fallbackForm="core" />
      <section data-scene="core" className="relative z-10">
        <div className="ax-shell grid items-start gap-x-16 gap-y-14 pb-[clamp(72px,10vw,140px)] pt-[clamp(120px,16vh,200px)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="lg:sticky lg:top-32">
            <p className="ax-label mb-7">Contact</p>
            <h1 className="ax-headline m-0 text-ax-text-primary">One channel, routed to the right people.</h1>
            <p className="ax-lede ax-measure mt-9">
              General, service, partnership, media or existing-client enquiries all start here.
            </p>
          </div>
          <div className="ax-veil">
            <ContactForm turnstileSiteKey={process.env.CAPTCHA_SITE_KEY} />
          </div>
        </div>
      </section>
    </div>
  );
}
