"use client";

import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";
import { createConstellationEngine, type Engine, type EngineMode } from "@/lib/motion/constellation/engine";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type ConstellationCanvasProps = {
  mode: EngineMode;
  className?: string;
  /** Scroll mode reads 0..1 progress from this element's position each frame. */
  progressRef?: React.RefObject<HTMLElement | null>;
  intensity?: number;
  links?: boolean;
  parallax?: boolean;
  introSeconds?: number;
  markScale?: number;
};

/**
 * Thin React boundary around the canvas engine: React owns mount, unmount and
 * the reduced-motion flag, and nothing else. No component state is touched per
 * frame, so the animation never triggers a React render.
 */
export function ConstellationCanvas({
  mode,
  className,
  progressRef,
  intensity,
  links,
  parallax,
  introSeconds,
  markScale,
}: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [supported, setSupported] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createConstellationEngine({
      canvas,
      mode,
      reducedMotion,
      intensity,
      links,
      parallax,
      introSeconds,
      markScale,
      getProgress: () => {
        const element = progressRef?.current;
        if (!element) return 0;
        const rect = element.getBoundingClientRect();
        const span = rect.height - window.innerHeight;
        if (span <= 0) return rect.top <= 0 ? 1 : 0;
        return Math.max(0, Math.min(1, -rect.top / span));
      },
    });

    if (!engine) {
      setSupported(false);
      return;
    }

    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // Reduced motion is applied through the imperative setter below so a
    // preference change never tears down and reseeds the whole field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, intensity, links, parallax, introSeconds, markScale, progressRef]);

  useEffect(() => {
    engineRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  if (!supported) {
    return (
      <div className={className} aria-hidden="true" data-constellation="fallback">
        <div className="flex h-full w-full items-center justify-center">
          <BrandMark material="spectral" size={132} />
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      data-constellation={mode}
      data-reduced-motion={reducedMotion ? "true" : "false"}
    />
  );
}
