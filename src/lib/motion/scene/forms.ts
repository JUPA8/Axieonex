import { createRng, flattenBlade, pointInPolygon, BLADE_A, BLADE_B, X_VIEWBOX } from "@/lib/motion/constellation/geometry";

/**
 * Scene forms for the AXIEONEX environment.
 *
 * Every form fills a target buffer in viewport pixel space, so a form can
 * deliberately bleed past an edge rather than sitting politely inside a box.
 * Forms are regenerated on resize, which is the only time aspect ratio can
 * change, so the per-frame loop never pays for this.
 *
 * Landscape and portrait are two different stages, not one scaled down. On a
 * wide viewport the copy holds the left column and the composition owns the
 * right. On a phone the copy sits in the lower half, so every form moves its
 * mass into the upper frame and grows against width instead of the short edge,
 * which is how the composition stays dominant at 390px.
 */
export type FormContext = {
  width: number;
  height: number;
  /** Per-particle depth in 0..1, already assigned by the field. */
  depth: Float32Array;
  count: number;
};

export type FormFiller = (targets: Float32Array, ctx: FormContext, seed: number) => void;

export const FORM_IDS = [
  "field",
  "scan",
  "cluster",
  "lanes",
  "validate",
  "mark",
  "core",
  "release",
] as const;

export type FormId = (typeof FORM_IDS)[number];

function write(targets: Float32Array, i: number, x: number, y: number) {
  targets[i * 2] = x;
  targets[i * 2 + 1] = y;
}

/** True when the viewport is tall enough that a left/right split stops working. */
function isPortrait(width: number, height: number): boolean {
  return height / width > 1.15;
}

/**
 * 1. The living market-signal field. A dominant volumetric mass bleeds off the
 * frame, with the remainder scattered as ambient signal so no region of the
 * viewport is ever dead, and the copy area stays open enough to read.
 */
const field: FormFiller = (targets, { width, height, count }, seed) => {
  const rng = createRng(seed);
  const portrait = isPortrait(width, height);
  const cx = portrait ? width * 0.52 : width * 0.82;
  const cy = portrait ? height * 0.27 : height * 0.46;
  const radius = portrait ? width * 0.66 : Math.min(width, height) * 0.56;
  const massShare = 0.78;
  // A wide viewport can afford a hollow rim because copy occupies the other
  // half; a phone shows the whole ring at once, so it has to read as a filled
  // volume instead of an empty circle.
  const inner = portrait ? 0.14 : 0.24;
  const falloff = portrait ? 0.66 : 0.58;

  for (let i = 0; i < count; i += 1) {
    if (rng() < massShare) {
      // Shell-weighted so the mass reads as a volume with a bright rim rather
      // than an evenly filled disc.
      const t = inner + Math.pow(rng(), falloff) * (1 - inner);
      const a = rng() * Math.PI * 2;
      write(targets, i, cx + Math.cos(a) * radius * t * 1.12, cy + Math.sin(a) * radius * t);
    } else {
      const x = rng() * width * 1.2 - width * 0.1;
      const y = rng() * height * 1.2 - height * 0.1;
      write(targets, i, x, y);
    }
  }
};

/** 2. A scanning volume: signals pulled into survey bands across the frame. */
const scan: FormFiller = (targets, { width, height, count }, seed) => {
  const rng = createRng(seed);
  // Fewer, wider bands on a phone: 26 bands across 390px would read as noise.
  const bands = isPortrait(width, height) ? 11 : 26;
  for (let i = 0; i < count; i += 1) {
    const band = Math.floor(rng() * bands);
    const bandX = ((band + 0.5) / bands) * width * 1.15 - width * 0.075;
    write(targets, i, bandX + (rng() - 0.5) * (width / bands) * 0.62, rng() * height * 1.2 - height * 0.1);
  }
};

/** 3. Dimensional intent clusters: a few dense volumes of qualified signal. */
const cluster: FormFiller = (targets, { width, height, count }, seed) => {
  const rng = createRng(seed);
  const portrait = isPortrait(width, height);
  const unit = portrait ? width : Math.min(width, height);
  const centres = portrait
    ? [
        { x: width * 0.56, y: height * 0.24, r: unit * 0.56 },
        { x: width * 0.22, y: height * 0.52, r: unit * 0.3 },
        { x: width * 0.82, y: height * 0.72, r: unit * 0.2 },
      ]
    : [
        { x: width * 0.72, y: height * 0.42, r: unit * 0.34 },
        { x: width * 0.3, y: height * 0.68, r: unit * 0.2 },
        { x: width * 0.12, y: height * 0.22, r: unit * 0.14 },
      ];
  for (let i = 0; i < count; i += 1) {
    const roll = rng();
    const c = roll < 0.6 ? centres[0] : roll < 0.86 ? centres[1] : centres[2];
    // Shell-weighted radius: denser at the surface, like a volume seen edge-on.
    const t = Math.pow(rng(), 0.34);
    const a = rng() * Math.PI * 2;
    write(targets, i, c.x + Math.cos(a) * c.r * t, c.y + Math.sin(a) * c.r * t * 0.94);
  }
};

/**
 * 4. Orchestration: coordinated channel pathways sweeping across the frame.
 * Portrait rotates the sweep to run down the viewport, because seven lanes
 * crossing 390px of width would collapse into a single smear.
 */
const lanes: FormFiller = (targets, { width, height, count }, seed) => {
  const rng = createRng(seed);
  const portrait = isPortrait(width, height);
  const laneCount = portrait ? 5 : 7;
  // Travel axis and spread axis swap with orientation.
  const travel = portrait ? height : width;
  const across = portrait ? width : height;

  for (let i = 0; i < count; i += 1) {
    const lane = i % laneCount;
    const t = rng();
    const spread = (lane / (laneCount - 1) - 0.5) * 2;
    const a0 = -travel * 0.14;
    const b0 = across * (0.5 + spread * 0.52);
    const ac = travel * 0.46;
    const bc = across * (0.5 + spread * 0.12);
    const a1 = travel * 1.06;
    const b1 = across * (0.5 + spread * 0.08);
    const inv = 1 - t;
    const along = inv * inv * a0 + 2 * inv * t * ac + t * t * a1;
    const off = inv * inv * b0 + 2 * inv * t * bc + t * t * b1;
    const jitter = (rng() - 0.5) * across * 0.05;
    if (portrait) write(targets, i, off + jitter, along);
    else write(targets, i, along, off + jitter);
  }
};

/** 5. Human validation: signals held in a reviewing arc before release. */
const validate: FormFiller = (targets, { width, height, count }, seed) => {
  const rng = createRng(seed);
  const portrait = isPortrait(width, height);
  const unit = portrait ? width : Math.min(width, height);
  const cx = portrait ? width * 0.5 : width * 0.56;
  const cy = portrait ? height * 0.3 : height * 0.52;
  const base = portrait ? 0.3 : 0.2;
  const step = portrait ? 0.13 : 0.082;
  for (let i = 0; i < count; i += 1) {
    const ring = Math.floor(rng() * 5);
    const r = unit * (base + ring * step) + (rng() - 0.5) * unit * 0.03;
    // A gate in the arc: the gap reads as work still passing through review.
    const a = -Math.PI * 0.82 + rng() * Math.PI * 1.64;
    write(targets, i, cx + Math.cos(a) * r * 1.22, cy + Math.sin(a) * r);
  }
};

/**
 * 6. The AXIEONEX X, built at environment scale from the canonical blades so
 * the brand mark is the dominant visual event rather than a small logo.
 */
const mark: FormFiller = (targets, { width, height, count }, seed) => {
  const rng = createRng(seed);
  const polygons = [flattenBlade(BLADE_A), flattenBlade(BLADE_B)];
  const portrait = isPortrait(width, height);
  // Portrait sizes against width and bleeds past both edges; landscape sizes
  // against the short edge so the mark fills the frame vertically.
  const size = portrait ? width * 1.28 : Math.min(width, height) * 1.02;
  const centreX = portrait ? width * 0.5 : width * 0.54;
  const centreY = portrait ? height * 0.46 : height * 0.5;
  const originX = centreX - size / 2;
  const originY = centreY - size / 2;

  let placed = 0;
  let guard = 0;
  while (placed < count && guard < count * 60) {
    guard += 1;
    const ux = rng() * X_VIEWBOX;
    const uy = rng() * X_VIEWBOX;
    const inside = polygons.some((p) => pointInPolygon({ x: ux, y: uy }, p));
    if (!inside) continue;
    write(targets, placed, originX + (ux / X_VIEWBOX) * size, originY + (uy / X_VIEWBOX) * size);
    placed += 1;
  }
  // Any remainder becomes a faint halo so the count is never starved.
  for (let i = placed; i < count; i += 1) {
    const a = rng() * Math.PI * 2;
    const r = size * (0.55 + rng() * 0.42);
    write(targets, i, centreX + Math.cos(a) * r, centreY + Math.sin(a) * r);
  }
};

/** 7. The qualified opportunity: one concentrated, luminous core. */
const core: FormFiller = (targets, { width, height, count }, seed) => {
  const rng = createRng(seed);
  const portrait = isPortrait(width, height);
  const unit = portrait ? width : Math.min(width, height);
  const cx = width * 0.5;
  const cy = portrait ? height * 0.3 : height * 0.48;
  for (let i = 0; i < count; i += 1) {
    const t = Math.pow(rng(), 1.9);
    const a = rng() * Math.PI * 2;
    const r = unit * (portrait ? 0.62 : 0.44) * t;
    write(targets, i, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.96);
  }
};

/** 8. Release: the opportunity leaves as a directed conversation signal. */
const release: FormFiller = (targets, { width, height, count }, seed) => {
  const rng = createRng(seed);
  const portrait = isPortrait(width, height);
  for (let i = 0; i < count; i += 1) {
    const t = Math.pow(rng(), 0.6);
    // The stream narrows as it travels, then flares past the far edge.
    const taper = 1 - t * 0.72;
    if (portrait) {
      const y = height * 0.1 + t * height * 0.95;
      const x = width * 0.5 + (rng() - 0.5) * width * 1.05 * taper;
      write(targets, i, x, y);
    } else {
      const x = width * 0.18 + t * width * 1.0;
      const y = height * 0.5 + (rng() - 0.5) * height * 0.72 * taper;
      write(targets, i, x, y);
    }
  }
};

export const FORMS: Record<FormId, FormFiller> = {
  field,
  scan,
  cluster,
  lanes,
  validate,
  mark,
  core,
  release,
};
