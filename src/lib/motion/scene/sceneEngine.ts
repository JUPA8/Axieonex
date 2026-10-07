import type { FormId } from "@/lib/motion/scene/forms";
import { SceneRenderer } from "@/lib/motion/scene/sceneRenderer";
import {
  createSceneField,
  layoutForms,
  particleBudget,
  settle,
  stepScene,
  type SceneField,
} from "@/lib/motion/scene/sceneField";

export type SceneEngine = {
  destroy: () => void;
  setReducedMotion: (reduced: boolean) => void;
  refreshStages: () => void;
};

export type SceneEngineOptions = {
  canvas: HTMLCanvasElement;
  reducedMotion: boolean;
  /** Form shown when a page declares no stages of its own. */
  fallbackForm?: FormId;
  intensity?: number;
};

const MAX_DPR = 2;

type Stage = { el: HTMLElement; form: FormId };

/**
 * Sections that build their stage list after mount (the pinned narrative
 * swaps its markup once JavaScript is ready) announce it with this event, so
 * the engine re-reads the DOM instead of holding a stale list.
 */
export const SCENES_CHANGED_EVENT = "axieonex:scenes-changed";

/**
 * Reads the page's `[data-scene]` sections and converts the document scroll
 * position into a form-to-form morph. Scenes belong to the content, so adding
 * or reordering a section changes the environment without touching this code.
 */
function readStages(): Stage[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<HTMLElement>("[data-scene]")).map((el) => ({
    el,
    form: (el.dataset.scene ?? "field") as FormId,
  }));
}

export function createSceneEngine(options: SceneEngineOptions): SceneEngine | null {
  const { canvas } = options;
  const maybeContext = canvas.getContext("2d", { alpha: true });
  if (!maybeContext) return null;
  const context: CanvasRenderingContext2D = maybeContext;
  const renderer = new SceneRenderer(context);

  const coarse =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(pointer: coarse)").matches
      : false;

  let reducedMotion = options.reducedMotion;
  let field: SceneField | null = null;
  let stages: Stage[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let elapsed = 0;
  let last = 0;
  let documentVisible = true;
  let disposed = false;

  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };

  function resize() {
    const nextWidth = Math.max(1, window.innerWidth);
    const nextHeight = Math.max(1, window.innerHeight);
    const budget = particleBudget(nextWidth, nextHeight, coarse);

    const sizeChanged = nextWidth !== width || nextHeight !== height;
    width = nextWidth;
    height = nextHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!field || field.count !== budget) {
      field = createSceneField(budget);
      layoutForms(field, width, height);
      settle(field, stages[0]?.form ?? options.fallbackForm ?? "field");
    } else if (sizeChanged) {
      layoutForms(field, width, height);
    }
  }

  /** Which stage the viewport is currently reading, and how far through it. */
  function resolveScene(): { from: FormId; to: FormId; blend: number } {
    const fallback = options.fallbackForm ?? "field";
    if (stages.length === 0) return { from: fallback, to: fallback, blend: 0 };

    const mid = height * 0.5;
    for (let i = 0; i < stages.length; i += 1) {
      const rect = stages[i].el.getBoundingClientRect();
      if (rect.bottom < mid && i < stages.length - 1) continue;

      const span = Math.max(rect.height, 1);
      const local = Math.min(1, Math.max(0, (mid - rect.top) / span));
      const next = stages[Math.min(i + 1, stages.length - 1)];
      // The last 35% of a stage morphs toward the next one, so the handover
      // happens while the current section is still on screen.
      const handover = Math.min(1, Math.max(0, (local - 0.65) / 0.35));
      return { from: stages[i].form, to: next.form, blend: handover };
    }
    const lastStage = stages[stages.length - 1];
    return { from: lastStage.form, to: lastStage.form, blend: 0 };
  }

  function paint() {
    if (!field) return;
    const scene = resolveScene();
    pointer.x += (pointerTarget.x - pointer.x) * 0.05;
    pointer.y += (pointerTarget.y - pointer.y) * 0.05;

    stepScene(field, {
      from: scene.from,
      to: scene.to,
      blend: scene.blend,
      width,
      height,
      time: elapsed,
      pointerX: reducedMotion ? 0 : pointer.x,
      pointerY: reducedMotion ? 0 : pointer.y,
      intensity: options.intensity ?? 1,
    });

    renderer.draw(field, { width, height, weave: scene.blend });
  }

  function loop(timestamp: number) {
    if (disposed) return;
    if (last === 0) last = timestamp;
    elapsed += Math.min(timestamp - last, 90);
    last = timestamp;
    paint();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (disposed || frame !== 0 || reducedMotion || !documentVisible) return;
    last = 0;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }

  /** Reduced motion still gets a fully composed frame, just a still one. */
  function renderStill() {
    if (!field) return;
    const scene = resolveScene();
    // Run the follow a few times so glyphs land on their targets rather than
    // rendering mid-interpolation.
    for (let i = 0; i < 26; i += 1) {
      stepScene(field, {
        from: scene.from,
        to: scene.to,
        blend: scene.blend,
        width,
        height,
        time: 0,
        pointerX: 0,
        pointerY: 0,
        intensity: options.intensity ?? 1,
      });
    }
    renderer.draw(field, { width, height, weave: scene.blend });
  }

  const handleResize = () => {
    resize();
    if (reducedMotion) renderStill();
  };

  const handleVisibility = () => {
    documentVisible = document.visibilityState !== "hidden";
    if (documentVisible) start();
    else stop();
  };

  const handlePointer = (event: PointerEvent) => {
    if (coarse) return;
    pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
  };

  /** Reduced motion has no loop, so it must repaint on scroll to stay in sync. */
  const handleScroll = () => {
    if (reducedMotion) renderStill();
  };

  const handleScenesChanged = () => {
    stages = readStages();
    if (reducedMotion) renderStill();
  };

  stages = readStages();
  resize();
  renderStill();

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("pointermove", handlePointer, { passive: true });
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener(SCENES_CHANGED_EVENT, handleScenesChanged);

  if (!reducedMotion) start();

  return {
    destroy() {
      disposed = true;
      stop();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener(SCENES_CHANGED_EVENT, handleScenesChanged);
      field = null;
    },
    setReducedMotion(next: boolean) {
      if (next === reducedMotion) return;
      reducedMotion = next;
      if (next) {
        stop();
        renderStill();
      } else {
        start();
      }
    },
    refreshStages() {
      stages = readStages();
      if (reducedMotion) renderStill();
    },
  };
}
