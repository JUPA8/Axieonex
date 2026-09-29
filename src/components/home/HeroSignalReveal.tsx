"use client";

import { motion } from "framer-motion";
import { ConstellationCanvas } from "@/components/motion/ConstellationCanvas";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SIGNAL_LABELS = [
  { text: "Funding signal", style: { left: "2%", top: "10%", color: "#8FA3E0" } },
  { text: "Hiring signal", style: { left: "0%", top: "82%", color: "#7FDEE6" } },
  { text: "Tech-stack signal", style: { right: "1%", top: "7%", color: "#B79CEF", textAlign: "right" as const } },
  { text: "Intent signal", style: { right: "0%", top: "87%", color: "#EBA0C9", textAlign: "right" as const } },
];

export function HeroSignalReveal() {
  const reduced = useReducedMotion();
  const lineTransition = (delay: number) => ({
    duration: reduced ? 0 : 0.9,
    delay: reduced ? 0 : delay,
    ease: [0.2, 0.7, 0.2, 1] as const,
  });

  return (
    <section id="home" className="relative mx-auto max-w-[1360px] px-5 pb-24 pt-36 sm:px-10 sm:pb-32 sm:pt-44">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div
            initial={{ y: reduced ? 0 : 34 }}
            animate={{ y: 0 }}
            transition={lineTransition(0.05)}
            className="mb-6 text-[13px] font-semibold tracking-wide text-ax-violet"
          >
            We do not automate sales. We orchestrate revenue.
          </motion.div>
          <h1 className="m-0 font-display text-[clamp(44px,6.2vw,80px)] font-extrabold leading-[0.98] tracking-tight">
            <motion.span
              initial={{ y: reduced ? 0 : 34 }}
              animate={{ y: 0 }}
              transition={lineTransition(0.15)}
              className="block"
            >
              We build revenue pipelines.
            </motion.span>
            <motion.span
              initial={{ y: reduced ? 0 : 34 }}
              animate={{ y: 0 }}
              transition={lineTransition(0.35)}
              className="block font-normal italic"
            >
              Not just meetings.
            </motion.span>
          </h1>
          <motion.p
            initial={{ y: reduced ? 0 : 34 }}
            animate={{ y: 0 }}
            transition={lineTransition(0.55)}
            className="mt-8 max-w-[46ch] text-lg leading-relaxed text-ax-text-muted"
          >
            An AI-orchestrated, human-executed revenue engine that replaces the cost and complexity of building an
            internal SDR team with one accountable system.
          </motion.p>
          <motion.div
            initial={{ y: reduced ? 0 : 34 }}
            animate={{ y: 0 }}
            transition={lineTransition(0.7)}
            className="mt-9 flex flex-wrap gap-3.5"
          >
            <a
              href="#engine"
              className="inline-flex min-h-11 items-center rounded-sm bg-ax-text-primary px-7 py-4 text-[15px] font-semibold text-[#05060b]"
            >
              See how it works
            </a>
            <Button href="/book-strategy-call" variant="secondary" magnetic>
              Discuss your market
            </Button>
          </motion.div>
        </div>

        <div className="relative order-first h-80 sm:h-[520px] lg:order-none" aria-hidden="true">
          <ConstellationCanvas
            mode="hero"
            className="absolute inset-0 h-full w-full"
            introSeconds={8}
            markScale={0.74}
          />
          {SIGNAL_LABELS.map((label) => (
            <div key={label.text} className="absolute text-[11.5px]" style={label.style}>
              {label.text}
            </div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 2.2 }}
            className="absolute bottom-1 left-1/2 w-56 -translate-x-1/2 text-center text-[12.5px] leading-relaxed text-ax-text-muted"
          >
            Orchestrated into one qualified conversation.
          </motion.div>
        </div>
      </div>
    </section>
  );
}
