"use client";

import { BrandMark } from "@/components/brand/BrandMark";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function NotFoundSignal() {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto h-[130px] w-[130px]" aria-hidden="true">
      <svg viewBox="0 0 130 130" className="absolute inset-0 h-full w-full">
        <circle
          cx={65}
          cy={65}
          r={40}
          fill="none"
          stroke="#E94FA8"
          strokeWidth={1.5}
          opacity={reduced ? 0.3 : undefined}
          className={reduced ? undefined : "animate-[ax-scan-ring_2.4s_ease-out_infinite]"}
        />
        {!reduced &&
          [
            { cx: 24, cy: 40, fill: "#E94FA8", delay: 0 },
            { cx: 106, cy: 34, fill: "#3E7BFA", delay: 0.5 },
            { cx: 18, cy: 94, fill: "#8B5CF6", delay: 1 },
          ].map((dot, i) => (
            <circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r={i === 0 ? 4 : 3.5}
              fill={dot.fill}
              className="animate-[ax-fail-dot_2.4s_ease-in-out_infinite]"
              style={{ animationDelay: `${dot.delay}s` }}
            />
          ))}
      </svg>
      <div
        className="absolute inset-[30px]"
        style={
          reduced
            ? undefined
            : { animation: "ax-mark-resolve 1.3s cubic-bezier(.2,.7,.2,1) both", animationDelay: "1.4s" }
        }
      >
        <BrandMark material="monochrome" size={70} />
      </div>
    </div>
  );
}
