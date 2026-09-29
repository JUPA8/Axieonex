"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { HOW_WE_WORK_CONTENT } from "@/content/howWeWork";

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
    <section className="ax-section">
      <ol className="ax-shell m-0 flex list-none flex-col gap-[clamp(48px,7vw,96px)] p-0">
        {HOW_WE_WORK_CONTENT.stages.map((stage, i) => (
          <li
            key={stage.n}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-stage={i}
            className="grid gap-x-12 gap-y-4 lg:grid-cols-[240px_1fr]"
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
                "border-l pl-8 transition-colors duration-500",
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
