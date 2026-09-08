"use client";

import { motion } from "framer-motion";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SIGNAL_PATHS = [
  { d: "M10,60 C120,20 180,150 210,210", stroke: "rgba(62,123,250,0.32)" },
  { d: "M20,340 C120,300 160,240 210,210", stroke: "rgba(53,211,224,0.32)" },
  { d: "M400,50 C300,90 250,140 210,210", stroke: "rgba(139,92,246,0.32)" },
  { d: "M400,370 C300,340 250,270 210,210", stroke: "rgba(233,79,168,0.32)" },
];

const SIGNAL_LABELS = [
  { text: "Funding signal", style: { left: "6%", top: "12%", color: "#8FA3E0" } },
  { text: "Hiring signal", style: { left: "2%", top: "80%", color: "#7FDEE6" } },
  { text: "Tech-stack signal", style: { right: "4%", top: "8%", color: "#B79CEF", textAlign: "right" as const } },
  { text: "Intent signal", style: { right: "2%", top: "86%", color: "#EBA0C9", textAlign: "right" as const } },
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

        <div className="relative order-first h-72 sm:h-[440px] lg:order-none" aria-hidden="true">
          <svg viewBox="0 0 420 420" width="100%" height="100%" className="absolute inset-0 overflow-visible">
            {SIGNAL_PATHS.map((p) => (
              <path key={p.d} d={p.d} fill="none" stroke={p.stroke} strokeWidth={1} />
            ))}
            {!reduced && (
              <>
                <circle r={4} fill="#3E7BFA">
                  <animateMotion dur="6.5s" repeatCount="indefinite" path={SIGNAL_PATHS[0].d} />
                </circle>
                <circle r={2.4} fill="#35D3E0" opacity={0.55}>
                  <animateMotion dur="7.8s" begin="0.9s" repeatCount="indefinite" path={SIGNAL_PATHS[1].d} />
                </circle>
                <circle r={3.5} fill="#8B5CF6">
                  <animateMotion dur="7.2s" begin="1.6s" repeatCount="indefinite" path={SIGNAL_PATHS[2].d} />
                </circle>
                <circle r={2.8} fill="#E94FA8" opacity={0.7}>
                  <animateMotion dur="8.4s" begin="0.4s" repeatCount="indefinite" path={SIGNAL_PATHS[3].d} />
                </circle>
              </>
            )}
          </svg>
          {SIGNAL_LABELS.map((label) => (
            <div key={label.text} className="absolute text-[11.5px]" style={label.style}>
              {label.text}
            </div>
          ))}
          <motion.div
            initial={{ scale: reduced ? 1 : 0.6, opacity: reduced ? 1 : 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : 1.4, ease: [0.2, 0.75, 0.15, 1] }}
            className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2"
            style={{ filter: "drop-shadow(var(--ax-glow-accent))" }}
          >
            <BrandMark material="spectral" size={112} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 2.2 }}
            className="absolute left-1/2 top-[64%] w-56 -translate-x-1/2 text-center text-[12.5px] leading-relaxed text-ax-text-muted"
          >
            Orchestrated into one qualified conversation.
          </motion.div>
        </div>
      </div>
    </section>
  );
}
