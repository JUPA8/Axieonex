"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { HOW_WE_WORK_CONTENT } from "@/content/howWeWork";
import type { FormId } from "@/lib/motion/scene/forms";

/**
 * The environment state each stage drives. The ten stages weave between
 * detection, orchestration and validation rather than cycling arbitrarily, so
 * the backdrop tells the same story the copy does.
 */
const STAGE_SCENES: FormId[] = [
  "scan",
  "cluster",
  "lanes",
  "lanes",
  "validate",
  "lanes",
  "lanes",
  "validate",
  "mark",
  "core",
];

export function ScrollChapterSequence() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number((entry.target as HTMLElement).dataset.stage));
          }
        });
      },
      { threshold: 0.5, rootMargin: "-88px 0px -40% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative z-10 ax-section">
      <ol className="ax-shell m-0 flex list-none flex-col p-0">
        {HOW_WE_WORK_CONTENT.stages.map((stage, i) => (
          <li
            key={stage.n}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-stage={i}
            data-scene={STAGE_SCENES[i % STAGE_SCENES.length]}
            className="grid min-h-[78vh] content-center gap-x-12 gap-y-4 lg:grid-cols-[240px_1fr]"
          >
            <div
              aria-hidden="true"
              className={cn(
                "font-mono text-[12px] tracking-[0.1em] transition-colors duration-500",
                activeIndex === i ? "text-ax-violet" : "text-ax-text-muted",
              )}
            >
              {stage.n}
            </div>
            <div
              className={cn(
                "ax-veil border-l pl-8 transition-colors duration-500",
                activeIndex === i ? "border-ax-violet" : "border-ax-border-subtle",
              )}
            >
              <h2 className="ax-headline-sm m-0 mb-4 text-ax-text-primary">{stage.title}</h2>
              <p className="ax-lede max-w-[56ch]">{stage.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
