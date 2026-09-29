"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function HeroSignalReveal() {
  const reduced = useReducedMotion();
  // Transform only, never opacity: the hero copy and CTAs must be legible even
  // if JavaScript is slow, blocked, or fails outright.
  const rise = (delay: number) => ({
    initial: { y: reduced ? 0 : 28 },
    animate: { y: 0 },
    transition: { duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: [0.2, 0.7, 0.2, 1] as const },
  });

  return (
    <section
      id="home"
      data-scene="field"
      className="relative z-10 flex min-h-screen items-center pt-[clamp(96px,12vh,160px)]"
    >
      <div className="ax-shell w-full">
        <motion.p {...rise(0.05)} className="ax-label mb-7">
          AI orchestrated. Human executed.
        </motion.p>
        <div className="max-w-[20ch]">
          <h1 className="ax-display ax-hero-display m-0">
            <motion.span {...rise(0.14)} className="block text-ax-text-primary">
              We build revenue
            </motion.span>
            <motion.span {...rise(0.24)} className="block text-ax-text-primary">
              pipelines.
            </motion.span>
            <motion.span {...rise(0.34)} className="block font-extralight text-ax-text-muted">
              Not just meetings.
            </motion.span>
          </h1>
        </div>

        <motion.p {...rise(0.48)} className="ax-lede ax-measure ax-hero-lede mt-8">
          An AI-orchestrated, human-executed revenue engine that replaces the cost and complexity of building an
          internal SDR team with one accountable system.
        </motion.p>

        <motion.div {...rise(0.6)} className="ax-hero-actions mt-10 flex flex-wrap items-center gap-x-9 gap-y-4">
          <Button href="/book-strategy-call" variant="primary" size="large" magnetic>
            Discuss your market
          </Button>
          <a
            href="#engine"
            className="inline-flex min-h-11 items-center text-[13px] font-semibold uppercase tracking-[0.08em] text-ax-text-muted transition-colors hover:text-ax-text-primary"
          >
            See how it works
          </a>
        </motion.div>
      </div>
    </section>
  );
}
