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
    <section className="px-5 py-20 sm:px-10">
      <ol className="mx-auto flex max-w-[720px] list-none flex-col gap-14">
        {HOW_WE_WORK_CONTENT.stages.map((stage, i) => (
          <li
            key={stage.n}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-stage={i}
            className={cn(
              "border-l-2 border-white/10 pl-7 transition-colors duration-500",
              activeIndex === i && "border-ax-cyan-alt bg-ax-cyan-alt/[0.04]",
            )}
          >
            <div
              className={cn("mb-2 font-mono text-sm font-bold text-[#3A3E52] transition-colors duration-500", activeIndex === i && "text-ax-cyan-alt")}
            >
              {stage.n}
            </div>
            <h2 className="mb-2 text-xl font-bold">{stage.title}</h2>
            <p className="max-w-[56ch] text-[15px] leading-relaxed text-ax-text-muted">{stage.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
