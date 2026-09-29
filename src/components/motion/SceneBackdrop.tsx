"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { FormId } from "@/lib/motion/scene/forms";
import { createSceneEngine, type SceneEngine } from "@/lib/motion/scene/sceneEngine";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The persistent AXIEONEX environment: one fixed, full-viewport canvas that
 * lives behind every section of a page and morphs between the forms declared
 * by that page's `[data-scene]` sections. Mounted once per page, never per
 * section, so the environment is continuous rather than restarting.
 */
export function SceneBackdrop({
  fallbackForm = "field",
  intensity,
}: {
  fallbackForm?: FormId;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createSceneEngine({ canvas, reducedMotion, fallbackForm, intensity });
    if (!engine) return;
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // Reduced motion is applied imperatively so toggling it never reseeds the
    // whole field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackForm, intensity]);

  useEffect(() => {
    engineRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  // Sections change with the route, so the stage list has to be re-read after
  // the new page commits.
  useEffect(() => {
    engineRef.current?.refreshStages();
  }, [pathname]);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      <div aria-hidden="true" className="ax-scrim" />
    </>
  );
}
