import { createRng } from "@/lib/motion/constellation/geometry";
import { FORM_IDS, FORMS, type FormId } from "@/lib/motion/scene/forms";

export type SceneField = {
  count: number;
  /** Target buffers, one per form, in viewport pixel space. */
  targets: Record<FormId, Float32Array>;
  x: Float32Array;
  y: Float32Array;
  depth: Float32Array;
  spin: Float32Array;
  spinRate: Float32Array;
  phase: Float32Array;
  drift: Float32Array;
  palette: Uint8Array;
  /** Render output. */
  rx: Float32Array;
  ry: Float32Array;
  rs: Float32Array;
  ra: Float32Array;
  rrot: Float32Array;
};

export function createSceneField(count: number, seed = 0x41584f): SceneField {
  const rng = createRng(seed);
  const field: SceneField = {
    count,
    targets: {} as Record<FormId, Float32Array>,
    x: new Float32Array(count),
    y: new Float32Array(count),
    depth: new Float32Array(count),
    spin: new Float32Array(count),
    spinRate: new Float32Array(count),
    phase: new Float32Array(count),
    drift: new Float32Array(count),
    palette: new Uint8Array(count),
    rx: new Float32Array(count),
    ry: new Float32Array(count),
    rs: new Float32Array(count),
    ra: new Float32Array(count),
    rrot: new Float32Array(count),
  };

  for (const id of FORM_IDS) field.targets[id] = new Float32Array(count * 2);

  for (let i = 0; i < count; i += 1) {
    // Depth is weighted toward the far layers so a handful of large
    // foreground glyphs read against a dense distant haze.
    field.depth[i] = Math.pow(rng(), 2.1);
    field.spin[i] = rng() * Math.PI * 2;
    field.spinRate[i] = (rng() - 0.5) * 0.00042;
    field.phase[i] = rng() * Math.PI * 2;
    field.drift[i] = 0.4 + rng() * 1.1;
    const roll = rng();
    field.palette[i] = roll < 0.42 ? 0 : roll < 0.6 ? 1 : roll < 0.74 ? 2 : roll < 0.87 ? 3 : 4;
  }

  return field;
}

/** Rebuilds every form's targets for the current viewport. */
export function layoutForms(field: SceneField, width: number, height: number): void {
  const ctx = { width, height, depth: field.depth, count: field.count };
  FORM_IDS.forEach((id, index) => {
    FORMS[id](field.targets[id], ctx, 0x9e3779b9 ^ (index * 0x85ebca6b));
  });
}

/** Seeds live positions so the first frame is already composed, not a burst. */
export function settle(field: SceneField, form: FormId): void {
  const t = field.targets[form];
  for (let i = 0; i < field.count; i += 1) {
    field.x[i] = t[i * 2];
    field.y[i] = t[i * 2 + 1];
  }
}

export type SceneStep = {
  from: FormId;
  to: FormId;
  /** 0..1 morph between the two forms. */
  blend: number;
  width: number;
  height: number;
  time: number;
  pointerX: number;
  pointerY: number;
  intensity: number;
};

function smooth(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

export function stepScene(field: SceneField, s: SceneStep): void {
  const a = field.targets[s.from];
  const b = field.targets[s.to];
  const blend = smooth(s.blend);
  const short = Math.min(s.width, s.height);

  for (let i = 0; i < field.count; i += 1) {
    const depth = field.depth[i];
    const phase = field.phase[i];
    const drift = field.drift[i];

    // Per-particle stagger means the form reassembles as a wave rather than
    // every glyph arriving on the same frame.
    const stagger = 0.72 + depth * 0.28;
    const local = Math.min(1, blend / stagger);

    const tx = a[i * 2] + (b[i * 2] - a[i * 2]) * local;
    const ty = a[i * 2 + 1] + (b[i * 2 + 1] - a[i * 2 + 1]) * local;

    // Continuous ambient wander so no state is ever frozen.
    const wanderX = Math.sin(s.time * 0.00019 * drift + phase) * short * 0.016 * (0.35 + depth);
    const wanderY = Math.cos(s.time * 0.00016 * drift + phase * 1.27) * short * 0.016 * (0.35 + depth);

    // Parallax: near glyphs travel far, distant haze barely shifts.
    const par = 8 + depth * 76;

    const x = tx + wanderX + s.pointerX * par;
    const y = ty + wanderY + s.pointerY * par * 0.62;

    // Critically damped follow keeps motion organic without jitter.
    field.x[i] += (x - field.x[i]) * 0.12;
    field.y[i] += (y - field.y[i]) * 0.12;

    field.spin[i] += field.spinRate[i] * 16;

    const size = (0.85 + Math.pow(depth, 2.7) * 26) * (short / 900);
    const twinkle = 0.82 + Math.sin(s.time * 0.0011 + phase * 2.1) * 0.18;
    const alpha = (0.16 + depth * 0.72) * twinkle * s.intensity;

    field.rx[i] = field.x[i];
    field.ry[i] = field.y[i];
    field.rs[i] = size;
    field.ra[i] = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
    field.rrot[i] = field.spin[i];
  }
}

export function particleBudget(width: number, height: number, coarse: boolean): number {
  const area = Math.max(width * height, 1);
  const reference = 1440 * 900;
  const scaled = Math.round(3200 * Math.sqrt(area / reference));
  // Touch devices still need enough glyphs for a form to read as a form: the
  // triangle path is cheap (no per-glyph save/restore), so the ceiling is set
  // by fill rate, not by count.
  return Math.max(320, Math.min(coarse ? 1500 : 3600, scaled));
}
