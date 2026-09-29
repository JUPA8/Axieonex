import type { SceneField } from "@/lib/motion/scene/sceneField";

type Rgb = [number, number, number];

/**
 * AXIEONEX palette only. Amber carries human judgement, the cool spectrum
 * carries machine-detected signal, and the neutral is unclassified noise.
 */
const PALETTE: Rgb[] = [
  [150, 156, 172], // unclassified signal
  [62, 123, 250], // ax-blue
  [53, 211, 224], // ax-cyan
  [139, 92, 246], // ax-violet
  [232, 179, 104], // ax-warning, human validation
];

const ALPHA_STEPS = 7;
const TAU = Math.PI * 2;
const THIRD = TAU / 3;

/** Glyphs below this size are filled; larger ones are drawn as outlines. */
const OUTLINE_MIN_SIZE = 4.2;

function colorTable(): string[][] {
  return PALETTE.map(([r, g, b]) =>
    Array.from({ length: ALPHA_STEPS }, (_, step) => `rgba(${r},${g},${b},${((step + 0.6) / ALPHA_STEPS).toFixed(3)})`),
  );
}

export type SceneRenderOptions = {
  width: number;
  height: number;
  /** Extra violet accent on the linking web, raised during orchestration. */
  weave: number;
};

export class SceneRenderer {
  private readonly colors = colorTable();
  private readonly fillBuckets: number[][] = [];
  private readonly strokeBuckets: number[][] = [];

  constructor(private readonly ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < PALETTE.length * ALPHA_STEPS; i += 1) {
      this.fillBuckets.push([]);
      this.strokeBuckets.push([]);
    }
  }

  draw(field: SceneField, options: SceneRenderOptions): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, options.width, options.height);
    // Additive blending gives overlapping glyphs real luminous depth on black.
    ctx.globalCompositeOperation = "lighter";

    for (const b of this.fillBuckets) b.length = 0;
    for (const b of this.strokeBuckets) b.length = 0;

    for (let i = 0; i < field.count; i += 1) {
      const alpha = field.ra[i];
      if (alpha <= 0.015) continue;
      const step = Math.min(ALPHA_STEPS - 1, Math.floor(alpha * ALPHA_STEPS));
      const key = field.palette[i] * ALPHA_STEPS + step;
      if (field.rs[i] >= OUTLINE_MIN_SIZE) this.strokeBuckets[key].push(i);
      else this.fillBuckets[key].push(i);
    }

    this.paint(field, this.fillBuckets, false);
    this.paint(field, this.strokeBuckets, true);

    ctx.globalCompositeOperation = "source-over";
  }

  private paint(field: SceneField, buckets: number[][], outline: boolean): void {
    const { ctx } = this;
    for (let key = 0; key < buckets.length; key += 1) {
      const list = buckets[key];
      if (list.length === 0) continue;

      ctx.beginPath();
      for (const i of list) {
        const x = field.rx[i];
        const y = field.ry[i];
        const s = field.rs[i];
        const r = field.rrot[i];
        // Three vertices computed directly: no per-glyph save/rotate/restore,
        // which is what makes thousands of rotated glyphs affordable.
        const c0 = Math.cos(r);
        const s0 = Math.sin(r);
        const c1 = Math.cos(r + THIRD);
        const s1 = Math.sin(r + THIRD);
        const c2 = Math.cos(r + THIRD * 2);
        const s2 = Math.sin(r + THIRD * 2);
        ctx.moveTo(x + c0 * s, y + s0 * s);
        ctx.lineTo(x + c1 * s, y + s1 * s);
        ctx.lineTo(x + c2 * s, y + s2 * s);
        ctx.closePath();
      }

      const color = this.colors[Math.floor(key / ALPHA_STEPS)][key % ALPHA_STEPS];
      if (outline) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.15;
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }
}
