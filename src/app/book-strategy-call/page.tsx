import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/BookingWizard";
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
    <div data-theme="strategy-call" className="bg-ax-ink-2 text-ax-text-primary">
      <section className="px-5 pb-24 pt-28 sm:px-10 sm:pt-36">
        <div className="mx-auto max-w-[560px]">
          <BookingWizard />
        </div>
      </section>
    </div>
  );
}
