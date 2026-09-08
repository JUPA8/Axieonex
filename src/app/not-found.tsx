import type { Metadata } from "next";
import { NotFoundSignal } from "@/components/not-found/NotFoundSignal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page Not Found | AXIEONEX",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div data-theme="not-found" className="flex min-h-[70vh] items-center justify-center bg-ax-ink-2 px-5 py-24 text-center text-ax-text-primary sm:px-10">
      <div className="mx-auto max-w-[540px]">
        <div className="mb-6 font-mono text-xs tracking-[0.1em] text-ax-magenta">SIGNAL NOT RESOLVED · 404</div>
        <NotFoundSignal />
        <h1 className="mb-4 mt-8 text-[length:var(--ax-fs-h1-fluid)] font-bold tracking-tight">This page could not be found.</h1>
        <p className="mx-auto mb-10 max-w-[52ch] text-base leading-relaxed text-ax-text-muted">
          The route you followed does not match anything in our system. It may have moved, been renamed, or never
          existed. Here is how to get back on track.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button href="/" variant="primary">
            Return home
          </Button>
          <Button href="/services" variant="secondary">
            Explore services
          </Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
          <Button href="/book-strategy-call" variant="secondary">
            Book a strategy call
          </Button>
        </div>
      </div>
    </div>
  );
}
