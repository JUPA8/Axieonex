"use client";

import { useRef } from "react";
import { ConstellationCanvas } from "@/components/motion/ConstellationCanvas";

/**
 * Low-density scroll-linked field used as a section backdrop. It shares the
 * hero's engine but runs dimmer and without link lines so it adds depth
 * without competing with the copy sitting on top of it.
 */
export function AmbientField({
  className = "",
  intensity = 0.42,
  markScale = 0.52,
}: {
  className?: string;
  intensity?: number;
  markScale?: number;
}) {
  const scopeRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scopeRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <ConstellationCanvas
        mode="scroll"
        className="absolute inset-0 h-full w-full"
        progressRef={scopeRef}
        intensity={intensity}
        markScale={markScale}
        links={false}
        parallax={false}
      />
    </div>
  );
}
