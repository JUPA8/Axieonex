import { createField, stepField, type Field, type Pointer } from "@/lib/motion/constellation/field";
import { narrativeAt, stageProgressToNarrative } from "@/lib/motion/constellation/narrative";
import { ConstellationRenderer } from "@/lib/motion/constellation/renderer";

export type EngineMode = "hero" | "scroll";

export type EngineOptions = {
  canvas: HTMLCanvasElement;
  mode: EngineMode;
  reducedMotion: boolean;
  /** 0..1 scroll position, read each frame in scroll mode. */
  getProgress?: () => number;
  intensity?: number;
  links?: boolean;
  parallax?: boolean;
  /** Seconds the hero intro takes before settling into idle. */
  introSeconds?: number;
  markScale?: number;
};

export type Engine = {
  destroy: () => void;
  setReducedMotion: (reduced: boolean) => void;
  /** Exposed for tests and for the reduced-motion static frame. */
  renderOnce: () => void;
};

const MAX_DPR = 2;

/**
 * Particle budget scales with the area actually being painted and drops hard
 * on coarse-pointer devices, where fill rate rather than logic is the limit.
 */
export function particleBudget(width: number, height: number, coarsePointer: boolean): number {
  const area = Math.max(width * height, 1);
  const reference = 1440 * 620;
  const scaled = Math.round(1400 * Math.sqrt(area / reference));
  const ceiling = coarsePointer ? 520 : 1600;
  return Math.max(160, Math.min(ceiling, scaled));
}

export function createConstellationEngine(options: EngineOptions): Engine | null {
  const { canvas, mode } = options;
  const maybeContext = canvas.getContext("2d");
  if (!maybeContext) return null;
  // Declared with a non-nullable type so the hoisted helpers below keep it
  // narrowed without a cast.
  const context: CanvasRenderingContext2D = maybeContext;

  const renderer = new ConstellationRenderer(context);
  const coarsePointer =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(pointer: coarse)").matches
      : false;

  let reducedMotion = options.reducedMotion;
  let field: Field | null = null;
  let width = 0;
  let height = 0;
  let frame = 0;
  // Time is accumulated only while the loop actually runs, never taken from
  // wall clock: a tab hidden mid-intro must resume the story where it left
  // off rather than jumping to the end.
  let elapsedMs = 0;
  let lastTimestamp = 0;
  let visible = true;
  let documentVisible = true;
  let disposed = false;

  const pointer: Pointer = { x: 0, y: 0, strength: 0 };
  const pointerTarget = { x: 0, y: 0 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    if (nextWidth === width && nextHeight === height && field) return;

    width = nextWidth;
    height = nextHeight;
    const dpr = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = particleBudget(width, height, coarsePointer);
    if (!field || field.count !== count) {
      field = createField({ count, markScale: options.markScale ?? 0.78 });
    }
  }

  function currentProgress(elapsed: number): number {
    if (mode === "scroll") {
      return stageProgressToNarrative(options.getProgress?.() ?? 0);
    }
    const introMs = (options.introSeconds ?? 7.5) * 1000;
    return Math.min(1, elapsed / introMs);
  }

  function paint(elapsed: number) {
    if (!field) return;
    const progress = reducedMotion ? 1 : currentProgress(elapsed);
    const narrative = narrativeAt(progress);

    pointer.x += (pointerTarget.x - pointer.x) * 0.06;
    pointer.y += (pointerTarget.y - pointer.y) * 0.06;

    stepField(field, {
      width,
      height,
      time: reducedMotion ? 0 : elapsed,
      narrative,
      pointer,
      intensity: options.intensity ?? 1,
    });

    renderer.draw(field, {
      width,
      height,
      time: reducedMotion ? 0 : elapsed,
      narrative,
      links: options.links,
    });
  }

  function loop(timestamp: number) {
    if (disposed) return;
    if (lastTimestamp === 0) lastTimestamp = timestamp;
    // Clamped so a long frame gap (a backgrounded tab, a slow paint) advances
    // the story smoothly instead of teleporting it.
    elapsedMs += Math.min(timestamp - lastTimestamp, 100);
    lastTimestamp = timestamp;
    paint(elapsedMs);
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (disposed || frame !== 0 || reducedMotion) return;
    lastTimestamp = 0;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    lastTimestamp = 0;
  }

  function syncRunState() {
    if (reducedMotion) {
      stop();
      return;
    }
    if (visible && documentVisible) start();
    else stop();
  }

  function renderOnce() {
    resize();
    if (!field) return;
    // A single settled frame: the assembled X, no motion, used for
    // prefers-reduced-motion and as the first paint before the loop starts.
    const narrative = narrativeAt(1);
    stepField(field, { width, height, time: 0, narrative, pointer: { x: 0, y: 0, strength: 0 }, intensity: options.intensity ?? 1 });
    renderer.draw(field, { width, height, time: 0, narrative, links: options.links });
  }

  const handleVisibility = () => {
    documentVisible = document.visibilityState !== "hidden";
    syncRunState();
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (options.parallax === false || coarsePointer) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointerTarget.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerTarget.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pointer.strength = 1;
  };

  const handlePointerLeave = () => {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
  };

  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          resize();
          if (reducedMotion) renderOnce();
        });

  const intersectionObserver =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
            syncRunState();
          },
          { rootMargin: "120px" },
        );

  resize();
  renderOnce();

  resizeObserver?.observe(canvas);
  intersectionObserver?.observe(canvas);
  if (!resizeObserver) window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", handleVisibility);
  if (options.parallax !== false && !coarsePointer) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  }

  if (!intersectionObserver) visible = true;
  syncRunState();

  return {
    destroy() {
      disposed = true;
      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      field = null;
    },
    setReducedMotion(next: boolean) {
      if (next === reducedMotion) return;
      reducedMotion = next;
      lastTimestamp = 0;
      if (next) {
        stop();
        renderOnce();
      } else {
        syncRunState();
      }
    },
    renderOnce,
  };
}
