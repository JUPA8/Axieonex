import {
  BLADE_A,
  createRng,
  flattenBlade,
  pointInPolygon,
  sampleXInterior,
  X_VIEWBOX,
} from "@/lib/motion/constellation/geometry";
import type { NarrativeState } from "@/lib/motion/constellation/narrative";

/** Spectral ramp steps shared with the renderer's colour table. */
export const SPECTRAL_STEPS = 8;

export const ROLE_NOISE = 0;
export const ROLE_SIGNAL = 1;
export const ROLE_VALIDATED = 2;

/** Coordinated channels named in the AXIEONEX operating model. */
export const CHANNELS = ["data", "ai", "email", "linkedin", "calling", "timing", "messaging"] as const;

export type FieldConfig = {
  count: number;
  seed?: number;
  /** X assembly size relative to the shorter canvas edge. */
  markScale?: number;
};

export type Pointer = { x: number; y: number; strength: number };

export type Field = {
  count: number;
  markScale: number;
  homeX: Float32Array;
  homeY: Float32Array;
  unitX: Float32Array;
  unitY: Float32Array;
  depth: Float32Array;
  phase: Float32Array;
  drift: Float32Array;
  priority: Float32Array;
  role: Uint8Array;
  channel: Uint8Array;
  /** 0..SPECTRAL_STEPS-1 position on the brand gradient, set by X blade membership. */
  spectral: Uint8Array;
  /** Position along the detection sweep at which this particle is classified. */
  gate: Float32Array;
  renderX: Float32Array;
  renderY: Float32Array;
  renderR: Float32Array;
  renderA: Float32Array;
  renderGlow: Float32Array;
};

export function createField({ count, seed = 0x41584f, markScale = 0.78 }: FieldConfig): Field {
  const rng = createRng(seed);
  const targets = sampleXInterior(count, seed ^ 0x9e37);
  const bladeAPolygon = flattenBlade(BLADE_A);

  const field: Field = {
    count,
    markScale,
    homeX: new Float32Array(count),
    homeY: new Float32Array(count),
    unitX: new Float32Array(count),
    unitY: new Float32Array(count),
    depth: new Float32Array(count),
    phase: new Float32Array(count),
    drift: new Float32Array(count),
    priority: new Float32Array(count),
    role: new Uint8Array(count),
    channel: new Uint8Array(count),
    spectral: new Uint8Array(count),
    gate: new Float32Array(count),
    renderX: new Float32Array(count),
    renderY: new Float32Array(count),
    renderR: new Float32Array(count),
    renderA: new Float32Array(count),
    renderGlow: new Float32Array(count),
  };

  for (let i = 0; i < count; i += 1) {
    field.homeX[i] = rng();
    field.homeY[i] = rng();
    field.depth[i] = 0.18 + rng() * 0.82;
    field.phase[i] = rng() * Math.PI * 2;
    field.drift[i] = 0.35 + rng() * 0.9;
    field.priority[i] = rng();
    field.channel[i] = Math.floor(rng() * CHANNELS.length);
    field.gate[i] = field.homeX[i] * 0.82 + rng() * 0.18;

    const roll = rng();
    field.role[i] = roll < 0.54 ? ROLE_NOISE : roll < 0.87 ? ROLE_SIGNAL : ROLE_VALIDATED;

    const target = targets[i % Math.max(targets.length, 1)] ?? { x: X_VIEWBOX / 2, y: X_VIEWBOX / 2 };
    const ux = target.x / X_VIEWBOX;
    const uy = target.y / X_VIEWBOX;
    field.unitX[i] = ux;
    field.unitY[i] = uy;

    // Colour follows the logo's own two gradients: the blade running
    // top-left to bottom-right carries blue into violet, the opposite blade
    // violet into magenta. The assembled X therefore reads as the real mark
    // rather than as randomly tinted confetti.
    const onBladeA = pointInPolygon(target, bladeAPolygon);
    const along = onBladeA ? (ux + uy) / 2 : (1 - ux + uy) / 2;
    const spectral = onBladeA ? along * 0.5 : 0.5 + along * 0.5;
    field.spectral[i] = Math.max(0, Math.min(SPECTRAL_STEPS - 1, Math.floor(spectral * SPECTRAL_STEPS)));
  }

  return field;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Curved lane routing for the orchestration beat. Each channel enters from
 * its own side of the frame and bends toward the centre, so approved signals
 * read as coordinated pathways rather than straight spokes.
 */
function lanePoint(channel: number, t: number, width: number, height: number, out: { x: number; y: number }) {
  const angle = (channel / CHANNELS.length) * Math.PI * 2;
  const radius = Math.min(width, height) * 0.52;
  const cx = width / 2;
  const cy = height / 2;

  const startX = cx + Math.cos(angle) * radius * 1.35;
  const startY = cy + Math.sin(angle) * radius * 1.35;
  const controlX = cx + Math.cos(angle + 0.9) * radius * 0.72;
  const controlY = cy + Math.sin(angle + 0.9) * radius * 0.72;

  const inv = 1 - t;
  out.x = inv * inv * startX + 2 * inv * t * controlX + t * t * cx;
  out.y = inv * inv * startY + 2 * inv * t * controlY + t * t * cy;
}

const laneOut = { x: 0, y: 0 };

export type StepOptions = {
  width: number;
  height: number;
  time: number;
  narrative: NarrativeState;
  pointer: Pointer;
  /** Global intensity, used to dim the ambient field in supporting sections. */
  intensity?: number;
};

export function stepField(field: Field, options: StepOptions): void {
  const { width, height, time, narrative, pointer } = options;
  const intensity = options.intensity ?? 1;
  const markSize = Math.min(width, height) * field.markScale;
  const markOriginX = (width - markSize) / 2;
  const markOriginY = (height - markSize) / 2;
  // Dots are sized relative to the canvas so a small phone canvas renders a
  // crisp mark instead of a coarse, blown-up version of the desktop one.
  const sizeScale = Math.max(0.68, Math.min(1.1, Math.min(width, height) / 520));

  for (let i = 0; i < field.count; i += 1) {
    const depth = field.depth[i];
    const phase = field.phase[i];
    const drift = field.drift[i];

    // Ambient signal field: slow, depth-scaled wander so the far layer barely
    // moves and the near layer feels alive.
    const wanderX = Math.sin(time * 0.00021 * drift + phase) * 0.028 * depth;
    const wanderY = Math.cos(time * 0.00017 * drift + phase * 1.3) * 0.028 * depth;
    let x = (field.homeX[i] + wanderX) * width;
    let y = (field.homeY[i] + wanderY) * height;

    const isNoise = field.role[i] === ROLE_NOISE;
    // Each particle is only classified once the sweep has crossed it.
    const passed = field.gate[i] <= narrative.classification ? 1 : 0;

    if (isNoise) {
      // Filtered noise drifts outward from centre as it fades.
      const push = narrative.noiseFade * passed;
      x += (x - width / 2) * push * 0.55;
      y += (y - height / 2) * push * 0.55;
    } else {
      if (narrative.orchestration > 0) {
        lanePoint(field.channel[i], narrative.orchestration, width, height, laneOut);
        const pull = narrative.orchestration * passed;
        x = lerp(x, laneOut.x, pull * 0.92);
        y = lerp(y, laneOut.y, pull * 0.92);
      }
      if (narrative.convergence > 0) {
        const targetX = markOriginX + field.unitX[i] * markSize;
        const targetY = markOriginY + field.unitY[i] * markSize;
        // A per-particle stagger keeps the X from snapping together as one block.
        const stagger = 0.72 + field.priority[i] * 0.28;
        const pull = Math.min(1, narrative.convergence / stagger);
        x = lerp(x, targetX, pull);
        y = lerp(y, targetY, pull);
      }
    }

    // Pointer parallax is depth weighted and never applied to the assembled
    // mark, which must stay locked to the logo's proportions.
    const parallax = pointer.strength * depth * (1 - narrative.convergence * 0.85);
    x += pointer.x * 26 * parallax;
    y += pointer.y * 26 * parallax;

    const settled = narrative.convergence;
    const breathe = 1 + Math.sin(time * 0.0012 + phase) * 0.06 * settled;

    let alpha: number;
    let radius: number;
    let glow = 0;

    if (isNoise) {
      alpha = (0.16 + depth * 0.3) * (1 - narrative.noiseFade * passed) * (1 - narrative.classification * 0.4 * passed);
      radius = 0.55 + depth * 0.95;
    } else {
      const detected = 0.3 + narrative.classification * passed * 0.7;
      const enriched = 1 + narrative.enrichment * field.priority[i] * 0.5;
      alpha = (0.34 + depth * 0.62) * detected;
      radius = (0.62 + depth * 1.05) * enriched * breathe;

      if (field.role[i] === ROLE_VALIDATED) {
        // Human validation is a visible act during its own beat, then the
        // validated signals rejoin the mark so the resolved X reads as the
        // brand gradient rather than a permanent amber speckle.
        const settledBack = 1 - narrative.convergence * 0.82;
        glow = narrative.validation * passed * (0.45 + field.priority[i] * 0.55) * settledBack;
        radius *= 1 + glow * 0.4;
      }
    }

    field.renderX[i] = x;
    field.renderY[i] = y;
    field.renderR[i] = radius * sizeScale;
    field.renderA[i] = Math.max(0, Math.min(1, alpha)) * intensity;
    field.renderGlow[i] = glow;
  }
}
