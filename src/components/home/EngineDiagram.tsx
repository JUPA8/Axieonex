"use client";

import { useEffect, useRef, useState } from "react";
import { ConstellationCanvas } from "@/components/motion/ConstellationCanvas";
import { cn } from "@/lib/cn";

const STAGES = [
  {
    n: "01",
    title: "Detection",
    body: "The market is noisy. Our AI continuously scans thousands of accounts, filtering out weak activity and isolating genuine buying intent: funding, hiring, technology-stack changes.",
  },
  {
    n: "02",
    title: "Orchestration",
    body: "Validated signals enter one coordinated system: data, messaging, email, LinkedIn and calling moving in sequence, with strategists supervising tone, timing and cadence throughout.",
  },
  {
    n: "03",
    title: "Qualified conversation",
    body: "The coordinated paths resolve into one opportunity. A human has validated it, managed the reply, and handled the objections. You step in ready to sell.",
  },
];

export function EngineDiagram() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.cap));
          }
        });
      },
      { threshold: 0.6 },
    );
    stageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} data-reveal className="relative px-5 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 text-center text-[13px] font-semibold text-ax-violet">One system, three stages</div>
        {/* No items-start: the visual column has to stretch to the full row
            height or its sticky child unpins before the last stage. */}
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Generous stage spacing on large screens is what gives the
              scroll-driven visual its range; the copy itself is unchanged. */}
          <div className="flex flex-col gap-16 lg:gap-[34vh]">
            {STAGES.map((stage, i) => (
              <div
                key={stage.n}
                ref={(el) => {
                  stageRefs.current[i] = el;
                }}
                data-cap={i}
                tabIndex={0}
                onFocus={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "border-l-2 border-white/10 pl-7 transition-colors duration-400",
                  active === i && "border-ax-violet",
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    "mb-2.5 font-display text-4xl font-extrabold text-ax-text-muted transition-colors duration-400",
                    active === i && "text-ax-violet",
                  )}
                >
                  {stage.n}
                </div>
                <h3 className="mb-2.5 text-2xl font-bold">{stage.title}</h3>
                <p className="max-w-[44ch] text-[15.5px] leading-relaxed text-ax-text-muted">{stage.body}</p>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-32 h-[460px] overflow-hidden rounded-lg border border-white/8 bg-white/[0.02]">
              <ConstellationCanvas
                mode="scroll"
                className="absolute inset-0 h-full w-full"
                progressRef={sectionRef}
                markScale={0.66}
                intensity={0.95}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
