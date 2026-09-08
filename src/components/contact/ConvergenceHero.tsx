"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";

const CENTER = { x: 100, y: 35 };
const DOTS: { fx: number; fy: number; color: string; delay: number }[] = [
  { fx: -70, fy: -20, color: "#3E7BFA", delay: 0 },
  { fx: 70, fy: -20, color: "#5CC8E8", delay: 0.1 },
  { fx: -70, fy: 20, color: "#8B5CF6", delay: 0.2 },
  { fx: 70, fy: 20, color: "#E94FA8", delay: 0.3 },
];

export function ConvergenceHero() {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 200 70" width={200} height={70} className="mx-auto overflow-visible" aria-hidden="true">
      {DOTS.map((dot, i) => (
        <circle
          key={i}
          cx={CENTER.x}
          cy={CENTER.y}
          r={4}
          fill={dot.color}
          opacity={reduced ? 0.6 : 0}
          style={
            reduced
              ? undefined
              : ({
                  "--fx": `${dot.fx}px`,
                  "--fy": `${dot.fy}px`,
                  animation: `ax-converge 1.1s ease-out forwards`,
                  animationDelay: `${dot.delay}s`,
                } as React.CSSProperties)
          }
        />
      ))}
      <circle cx={CENTER.x} cy={CENTER.y} r={7} fill="#5CC8E8" opacity={0.9} />
    </svg>
  );
}
