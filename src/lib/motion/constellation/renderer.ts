import { CHANNELS, ROLE_NOISE, ROLE_VALIDATED, SPECTRAL_STEPS, type Field } from "@/lib/motion/constellation/field";
import type { NarrativeState } from "@/lib/motion/constellation/narrative";

type Rgb = [number, number, number];

/** The BrandMark "spectral" material, sampled as a ramp. */
const GRADIENT_START: Rgb = [76, 130, 255]; // #4C82FF
const GRADIENT_MID: Rgb = [139, 92, 246]; // #8B5CF6
const GRADIENT_END: Rgb = [234, 79, 160]; // #EA4FA0
const NOISE_GREY: Rgb = [142, 146, 160]; // ax-text-muted
const AMBER: Rgb = [232, 179, 104]; // ax-warning, human validation

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export function spectralAt(t: number): Rgb {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5
    ? mix(GRADIENT_START, GRADIENT_MID, clamped * 2)
    : mix(GRADIENT_MID, GRADIENT_END, (clamped - 0.5) * 2);
}

/**
 * Index 0 is unclassified noise, 1..SPECTRAL_STEPS walk the brand gradient,
 * and the final index is the warm human-validation amber. Cool spectrum
 * therefore reads as machine-detected signal and amber as human judgement,
 * without introducing any colour outside the AXIEONEX system.
 */
const PALETTE: Rgb[] = [
  NOISE_GREY,
  ...Array.from({ length: SPECTRAL_STEPS }, (_, i) => spectralAt((i + 0.5) / SPECTRAL_STEPS)),
  AMBER,
];

const AMBER_INDEX = PALETTE.length - 1;
const ALPHA_BUCKETS = 8;

function buildColorTable(): string[][] {
  return PALETTE.map(([r, g, b]) =>
    Array.from({ length: ALPHA_BUCKETS }, (_, bucket) => {
      const alpha = ((bucket + 0.5) / ALPHA_BUCKETS).toFixed(3);
      return `rgba(${r},${g},${b},${alpha})`;
    }),
  );
}

export type RenderOptions = {
  width: number;
  height: number;
  time: number;
  narrative: NarrativeState;
  /** Draws the linking lines that give the field its constellation read. */
  links?: boolean;
  maxLinks?: number;
};

export class ConstellationRenderer {
  private readonly colors = buildColorTable();
  private readonly buckets: number[][] = PALETTE.map(() => []);
  private grid = new Map<number, number[]>();

  constructor(private readonly context: CanvasRenderingContext2D) {}

  draw(field: Field, options: RenderOptions): void {
    const { width, height, narrative } = options;
    const ctx = this.context;

    ctx.clearRect(0, 0, width, height);
    // Additive blending is what gives point lights their depth on a black
    // field: overlapping particles accumulate instead of flatly occluding.
    ctx.globalCompositeOperation = "lighter";
    if (options.links !== false) this.drawLinks(field, options);
    this.drawBloom(field);
    this.drawParticles(field);
    if (narrative.scanX >= 0) this.drawSweep(options);
    this.drawValidationMarks(field, options);
    if (narrative.resolution > 0) this.drawResolution(options);
    ctx.globalCompositeOperation = "source-over";
  }

  /** A single wide, faint disc under the brightest particles reads as glow far more cheaply than a blur filter. */
  private drawBloom(field: Field): void {
    const ctx = this.context;
    for (let colorIndex = 1; colorIndex < PALETTE.length; colorIndex += 1) {
      let started = false;
      for (let i = 0; i < field.count; i += 1) {
        if (field.renderA[i] < 0.34 || field.role[i] === ROLE_NOISE) continue;
        if (this.colorIndexFor(field, i) !== colorIndex) continue;
        if (!started) {
          ctx.beginPath();
          started = true;
        }
        const radius = field.renderR[i] * 2.1 + 1.1;
        ctx.moveTo(field.renderX[i] + radius, field.renderY[i]);
        ctx.arc(field.renderX[i], field.renderY[i], radius, 0, Math.PI * 2);
      }
      if (!started) continue;
      const [r, g, b] = PALETTE[colorIndex];
      ctx.fillStyle = `rgba(${r},${g},${b},0.038)`;
      ctx.fill();
    }
  }

  private colorIndexFor(field: Field, i: number): number {
    if (field.role[i] === ROLE_NOISE) return 0;
    if (field.role[i] === ROLE_VALIDATED && field.renderGlow[i] > 0.05) return AMBER_INDEX;
    return 1 + field.spectral[i];
  }

  private drawParticles(field: Field): void {
    const ctx = this.context;
    for (const bucketList of this.buckets) bucketList.length = 0;

    for (let i = 0; i < field.count; i += 1) {
      if (field.renderA[i] <= 0.012 || field.renderR[i] <= 0.05) continue;
      this.buckets[this.colorIndexFor(field, i)].push(i);
    }

    for (let colorIndex = 0; colorIndex < this.buckets.length; colorIndex += 1) {
      const indices = this.buckets[colorIndex];
      if (indices.length === 0) continue;

      // Batch by quantized alpha so a frame costs a few dozen fill calls
      // rather than one per particle.
      for (let bucket = 0; bucket < ALPHA_BUCKETS; bucket += 1) {
        let started = false;
        for (const i of indices) {
          const quantized = Math.min(ALPHA_BUCKETS - 1, Math.floor(field.renderA[i] * ALPHA_BUCKETS));
          if (quantized !== bucket) continue;
          if (!started) {
            ctx.beginPath();
            started = true;
          }
          ctx.moveTo(field.renderX[i] + field.renderR[i], field.renderY[i]);
          ctx.arc(field.renderX[i], field.renderY[i], field.renderR[i], 0, Math.PI * 2);
        }
        if (started) {
          ctx.fillStyle = this.colors[colorIndex][bucket];
          ctx.fill();
        }
      }
    }
  }

  /**
   * Neighbour links via a uniform grid, capped per frame. A full pairwise
   * pass would be O(n squared) and is the one thing that would actually cost
   * frames at these particle counts.
   */
  private drawLinks(field: Field, options: RenderOptions): void {
    const { width, height, narrative } = options;
    const reach = Math.min(width, height) * (0.052 + narrative.convergence * 0.026);
    const cell = reach;
    const columns = Math.max(1, Math.ceil(width / cell));
    const maxLinks = options.maxLinks ?? 420;

    this.grid.clear();
    for (let i = 0; i < field.count; i += 1) {
      if (field.role[i] === ROLE_NOISE || field.renderA[i] < 0.08) continue;
      const cx = Math.floor(field.renderX[i] / cell);
      const cy = Math.floor(field.renderY[i] / cell);
      const key = cy * columns + cx;
      const bucket = this.grid.get(key);
      if (bucket) bucket.push(i);
      else this.grid.set(key, [i]);
    }

    const ctx = this.context;
    ctx.beginPath();
    let drawn = 0;
    const reachSquared = reach * reach;

    for (const [key, bucket] of this.grid) {
      for (let a = 0; a < bucket.length && drawn < maxLinks; a += 1) {
        const i = bucket[a];
        for (let b = a + 1; b < bucket.length && drawn < maxLinks; b += 1) {
          const j = bucket[b];
          const dx = field.renderX[i] - field.renderX[j];
          const dy = field.renderY[i] - field.renderY[j];
          if (dx * dx + dy * dy > reachSquared) continue;
          ctx.moveTo(field.renderX[i], field.renderY[i]);
          ctx.lineTo(field.renderX[j], field.renderY[j]);
          drawn += 1;
        }
      }
      // Link one neighbouring cell only, which is enough to stitch the field
      // together without doubling the pair count.
      const right = this.grid.get(key + 1);
      if (!right) continue;
      for (let a = 0; a < bucket.length && drawn < maxLinks; a += 1) {
        const i = bucket[a];
        for (let b = 0; b < right.length && drawn < maxLinks; b += 1) {
          const j = right[b];
          const dx = field.renderX[i] - field.renderX[j];
          const dy = field.renderY[i] - field.renderY[j];
          if (dx * dx + dy * dy > reachSquared) continue;
          ctx.moveTo(field.renderX[i], field.renderY[i]);
          ctx.lineTo(field.renderX[j], field.renderY[j]);
          drawn += 1;
        }
      }
    }

    if (drawn === 0) return;
    const strength = 0.07 + narrative.orchestration * 0.09 + narrative.convergence * 0.13;
    ctx.strokeStyle = `rgba(124,120,240,${strength.toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawSweep({ width, height, narrative }: RenderOptions): void {
    const ctx = this.context;
    const x = narrative.scanX * width;
    const band = Math.max(60, width * 0.09);
    const gradient = ctx.createLinearGradient(x - band, 0, x + band, 0);
    gradient.addColorStop(0, "rgba(53,211,224,0)");
    gradient.addColorStop(0.5, "rgba(53,211,224,0.16)");
    gradient.addColorStop(1, "rgba(53,211,224,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - band, 0, band * 2, height);

    ctx.strokeStyle = "rgba(92,200,232,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  /** The human layer: an open ring, deliberately unlike the filled AI dots. */
  private drawValidationMarks(field: Field, { narrative }: RenderOptions): void {
    if (narrative.validation <= 0) return;
    const ctx = this.context;
    ctx.beginPath();
    let drawn = 0;
    for (let i = 0; i < field.count && drawn < 48; i += 1) {
      if (field.role[i] !== ROLE_VALIDATED || field.renderGlow[i] < 0.25) continue;
      const radius = field.renderR[i] + 2.6 + field.renderGlow[i] * 2.4;
      ctx.moveTo(field.renderX[i] + radius, field.renderY[i]);
      ctx.arc(field.renderX[i], field.renderY[i], radius, 0, Math.PI * 2);
      drawn += 1;
    }
    if (drawn === 0) return;
    ctx.strokeStyle = `rgba(${AMBER[0]},${AMBER[1]},${AMBER[2]},${(0.34 * narrative.validation).toFixed(3)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /** The single outgoing qualified-opportunity signal once the X is formed. */
  private drawResolution({ width, height, time, narrative }: RenderOptions): void {
    const ctx = this.context;
    const cx = width / 2;
    const cy = height / 2;
    const cycle = (time * 0.00022) % 1;
    const radius = Math.min(width, height) * (0.2 + cycle * 0.26);
    const fade = (1 - cycle) * (1 - cycle) * narrative.resolution * 0.34;

    if (fade > 0.01) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(139,92,246,${fade.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    const travel = (time * 0.00034) % 1;
    const dotX = cx + travel * (width * 0.5);
    const dotY = cy - Math.sin(travel * Math.PI) * height * 0.12;
    const dotFade = Math.sin(travel * Math.PI) * narrative.resolution;
    if (dotFade <= 0.02) return;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${AMBER[0]},${AMBER[1]},${AMBER[2]},${dotFade.toFixed(3)})`;
    ctx.fill();
  }
}

export const CHANNEL_COUNT = CHANNELS.length;
