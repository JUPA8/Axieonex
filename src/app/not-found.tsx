import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SceneBackdrop } from "@/components/motion/SceneBackdrop";

export const metadata: Metadata = {
  title: "Page Not Found | AXIEONEX",
  description: "The page you are looking for could not be found.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div data-theme="not-found">
      {/* A lost signal that rediscovers its path: the environment opens
          scattered and converges as the reader reaches the routes back. */}
      <SceneBackdrop fallbackForm="release" intensity={0.85} />
      <div data-scene="release" className="ax-shell relative z-10 flex min-h-screen max-w-[720px] flex-col justify-center py-[clamp(72px,10vw,140px)]">
        <div className="mb-10 font-mono text-[11px] tracking-[0.14em] text-ax-warning">SIGNAL NOT RESOLVED · 404</div>
        <h1 className="ax-display ax-hero-display m-0 mb-8 text-ax-text-primary">This page could not be found.</h1>
        <p className="ax-lede ax-measure mb-14">
          The route you followed does not match anything in our system. It may have moved, been renamed, or never
          existed. Here is how to get back on track.
        </p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
          <Button href="/" variant="primary">
            Return home
          </Button>
          <Button href="/services" variant="ghost">
            Explore services
          </Button>
          <Button href="/contact" variant="ghost">
            Contact us
          </Button>
          <Button href="/book-strategy-call" variant="ghost">
            Book a strategy call
          </Button>
        </div>
      </div>
    </div>
  );
}
