"use client";

import { motion } from "framer-motion";
import { ConstellationCanvas } from "@/components/motion/ConstellationCanvas";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SIGNAL_LABELS = [
  { text: "Funding signal", className: "left-0 top-[8%]" },
  { text: "Hiring signal", className: "left-0 bottom-[12%]" },
  { text: "Tech-stack signal", className: "right-0 top-[6%] text-right" },
  { text: "Intent signal", className: "right-0 bottom-[8%] text-right" },
];

export function HeroSignalReveal() {
  const reduced = useReducedMotion();
  // Transform only, never opacity: the hero copy and CTAs must be legible
  // even if JavaScript is slow, blocked, or fails outright, so nothing here
  // may ship an `opacity: 0` inline style from the server.
  const rise = (delay: number) => ({
    initial: { y: reduced ? 0 : 26 },
    animate: { y: 0 },
    transition: { duration: reduced ? 0 : 0.85, delay: reduced ? 0 : delay, ease: [0.2, 0.7, 0.2, 1] as const },
  });

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="ax-shell ax-hero-pad grid items-center gap-x-16 gap-y-12 pb-[clamp(64px,10vw,140px)] pt-[clamp(92px,16vh,200px)] lg:grid-cols-[1.02fr_0.98fr]">
        <div className="relative z-10">
          <motion.p {...rise(0.05)} className="ax-label mb-7">
            AI orchestrated. Human executed.
          </motion.p>

          <h1 className="ax-display m-0">
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

          <motion.p {...rise(0.48)} className="ax-lede ax-measure ax-hero-lede mt-10">
            An AI-orchestrated, human-executed revenue engine that replaces the cost and complexity of building an
            internal SDR team with one accountable system.
          </motion.p>

          <motion.div {...rise(0.6)} className="ax-hero-actions mt-12 flex flex-wrap items-center gap-x-9 gap-y-4">
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

        {/* No container, no border: the field floats directly on the void. */}
        <div
          className="relative order-first h-[clamp(290px,62vw,400px)] lg:order-none lg:h-[clamp(480px,44vw,660px)]"
          aria-hidden="true"
        >
          <ConstellationCanvas
            mode="hero"
            className="absolute inset-0 h-full w-full"
            introSeconds={8}
            markScale={0.72}
          />
          {SIGNAL_LABELS.map((label) => (
            <span
              key={label.text}
              className={`pointer-events-none absolute hidden text-[11px] uppercase tracking-[0.12em] text-ax-text-muted sm:block ${label.className}`}
            >
              {label.text}
            </span>
          ))}
        </div>
      </div>

      <motion.p
        {...rise(0.9)}
        className="ax-shell pb-[clamp(40px,6vw,72px)] text-[12px] uppercase tracking-[0.12em] text-ax-text-muted"
      >
        Orchestrated into one qualified conversation.
      </motion.p>
    </section>
  );
}
