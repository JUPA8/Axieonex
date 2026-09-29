import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { SceneBackdrop } from "@/components/motion/SceneBackdrop";
import { SITE_URL } from "@/lib/site";

const CANONICAL = `${SITE_URL}/book-strategy-call`;

export const metadata: Metadata = {
  title: "Book a Strategy Call | AXIEONEX",
  description: "Schedule a strategy session to map your revenue system.",
  alternates: { canonical: CANONICAL },
  robots: { index: false, follow: true },
};

export default function BookStrategyCallPage() {
  return (
    <div data-theme="strategy-call">
      <SceneBackdrop fallbackForm="core" intensity={0.72} />
      <section data-scene="core" className="relative z-10 pb-[clamp(72px,10vw,140px)] pt-[clamp(120px,15vh,180px)]">
        <div className="ax-shell-narrow ax-veil max-w-[680px]">
          <BookingWizard turnstileSiteKey={process.env.CAPTCHA_SITE_KEY} calendlyUrl={process.env.NEXT_PUBLIC_CALENDLY_URL} />
        </div>
      </section>
    </div>
  );
}
