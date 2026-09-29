export type Point = { x: number; y: number };

type QuadSegment = { cx: number; cy: number; x: number; y: number };
type Blade = { x: number; y: number; segments: QuadSegment[] };

/**
 * The canonical AXIEONEX X, as structured data rather than an SVG string so
 * particles can be sampled from its interior without a DOM or path parser.
 * These must stay byte-identical to the `d` attributes BrandMark renders;
 * `toPathD` plus tests/constellation-geometry.test.ts enforce that.
 */
export const BLADE_A: Blade = {
  x: 6,
  y: 10,
  segments: [
    { cx: 26, cy: 6, x: 34, y: 26 },
    { cx: 42, cy: 46, x: 58, y: 54 },
    { cx: 40, cy: 50, x: 30, y: 38 },
    { cx: 20, cy: 26, x: 6, y: 10 },
  ],
};

export const BLADE_B: Blade = {
  x: 58,
  y: 10,
  segments: [
    { cx: 38, cy: 6, x: 30, y: 26 },
    { cx: 22, cy: 46, x: 6, y: 54 },
    { cx: 24, cy: 50, x: 34, y: 38 },
    { cx: 44, cy: 26, x: 58, y: 10 },
  ],
};

export const X_VIEWBOX = 64;

export function toPathD(blade: Blade): string {
  const segments = blade.segments.map((s) => `Q${s.cx},${s.cy} ${s.x},${s.y}`).join(" ");
  return `M${blade.x},${blade.y} ${segments} Z`;
}

function quadAt(p0: Point, c: Point, p1: Point, t: number): Point {
  const inv = 1 - t;
  const a = inv * inv;
  const b = 2 * inv * t;
  const d = t * t;
  return { x: a * p0.x + b * c.x + d * p1.x, y: a * p0.y + b * c.y + d * p1.y };
}

/** Flattens a blade to a closed polygon; higher `stepsPerSegment` means a truer edge. */
export function flattenBlade(blade: Blade, stepsPerSegment = 24): Point[] {
  const points: Point[] = [{ x: blade.x, y: blade.y }];
  let cursor: Point = { x: blade.x, y: blade.y };

  for (const segment of blade.segments) {
    const control = { x: segment.cx, y: segment.cy };
    const end = { x: segment.x, y: segment.y };
    for (let step = 1; step <= stepsPerSegment; step += 1) {
      points.push(quadAt(cursor, control, end, step / stepsPerSegment));
    }
    cursor = end;
  }

  return points;
}

export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    const straddles = a.y > point.y !== b.y > point.y;
    if (straddles && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** Deterministic PRNG so a given particle count always yields the same X. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };
}

/**
 * Jittered-grid sampling rather than pure rejection sampling: an even lattice
 * with per-cell jitter reads as a deliberate constellation, where uniform
 * random points visibly clump and leave holes at these densities.
 */
export function sampleXInterior(count: number, seed = 0x415849): Point[] {
  if (count <= 0) return [];

  const polygons = [flattenBlade(BLADE_A), flattenBlade(BLADE_B)];
  const isInside = (point: Point) => polygons.some((polygon) => pointInPolygon(point, polygon));
  const rng = createRng(seed);

  // The blades fill roughly a third of the viewBox, so oversample the lattice
  // to land near `count` survivors after the interior test.
  const cells = Math.max(count * 3, 64);
  const columns = Math.ceil(Math.sqrt(cells));
  const spacing = X_VIEWBOX / columns;
  const collected: Point[] = [];

  for (let row = 0; row < columns; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const candidate = {
        x: (column + 0.15 + rng() * 0.7) * spacing,
        y: (row + 0.15 + rng() * 0.7) * spacing,
      };
      if (isInside(candidate)) collected.push(candidate);
    }
  }

  for (let i = collected.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [collected[i], collected[j]] = [collected[j], collected[i]];
  }

  if (collected.length >= count) return collected.slice(0, count);

  let guard = 0;
  while (collected.length < count && guard < count * 40) {
    guard += 1;
    const candidate = { x: rng() * X_VIEWBOX, y: rng() * X_VIEWBOX };
    if (isInside(candidate)) collected.push(candidate);
  }
  return collected;
}

/**
 * Maps viewBox-space points onto a canvas box, preserving aspect ratio and
 * centring, so the assembled X keeps the logo's proportions at any size.
 */
export function projectToBox(points: Point[], width: number, height: number, scale = 0.78): Point[] {
  const size = Math.min(width, height) * scale;
  const offsetX = (width - size) / 2;
  const offsetY = (height - size) / 2;
  const unit = size / X_VIEWBOX;
  return points.map((point) => ({ x: offsetX + point.x * unit, y: offsetY + point.y * unit }));
}
