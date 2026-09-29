/**
 * The AXIEONEX revenue story as a normalized 0..1 timeline. Everything the
 * renderer needs to know about "where we are in the story" is derived here,
 * so the simulation stays free of narrative branching and the beats can be
 * unit tested without a canvas.
 */
export const BEATS = [
  { key: "field", start: 0, end: 0.14 },
  { key: "detection", start: 0.14, end: 0.3 },
  { key: "filtering", start: 0.3, end: 0.42 },
  { key: "enrichment", start: 0.42, end: 0.54 },
  { key: "orchestration", start: 0.54, end: 0.72 },
  { key: "validation", start: 0.72, end: 0.82 },
  { key: "convergence", start: 0.82, end: 0.95 },
  { key: "resolution", start: 0.95, end: 1 },
] as const;

export type BeatKey = (typeof BEATS)[number]["key"];

export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/** Smooth 0..1 ramp across [start, end], flat outside it. */
export function ramp(progress: number, start: number, end: number): number {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

export function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

export function easeInOut(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export type NarrativeState = {
  progress: number;
  /** Horizontal position of the detection sweep in 0..1, -1 when not sweeping. */
  scanX: number;
  /** How strongly signals are separated from noise. */
  classification: number;
  /** How far noise has faded out. */
  noiseFade: number;
  /** Size/brightness weighting applied to surviving signals. */
  enrichment: number;
  /** Pull toward the coordinated channel lanes. */
  orchestration: number;
  /** Share of validated particles showing the human marker. */
  validation: number;
  /** Pull toward the assembled AXIEONEX X. */
  convergence: number;
  /** Outgoing qualified-opportunity pulse, 0..1 once the X is formed. */
  resolution: number;
};

export function narrativeAt(progress: number): NarrativeState {
  const p = clamp01(progress);
  const beat = (key: BeatKey) => {
    const found = BEATS.find((b) => b.key === key);
    if (!found) return 0;
    return ramp(p, found.start, found.end);
  };

  const detection = beat("detection");

  return {
    progress: p,
    scanX: detection > 0 && detection < 1 ? detection : -1,
    // Classification tracks the sweep itself: a particle is only sorted once
    // the wavefront has actually passed over it.
    classification: smoothstep(detection),
    noiseFade: smoothstep(beat("filtering")),
    enrichment: smoothstep(beat("enrichment")),
    orchestration: easeInOut(beat("orchestration")),
    validation: smoothstep(beat("validation")),
    convergence: easeInOut(beat("convergence")),
    resolution: smoothstep(beat("resolution")),
  };
}

/**
 * Scroll-driven sections show three named stages rather than eight beats.
 * Earlier stages stay partially lit so the visual reads as one continuous
 * system rather than three separate slides.
 */
export type StageWeights = { detection: number; orchestration: number; qualified: number };

export function stageWeights(progress: number): StageWeights {
  const p = clamp01(progress);
  return {
    detection: 1 - smoothstep(ramp(p, 0.18, 0.52)) * 0.62,
    orchestration: smoothstep(ramp(p, 0.16, 0.5)) * (1 - smoothstep(ramp(p, 0.58, 0.9)) * 0.55),
    qualified: smoothstep(ramp(p, 0.56, 0.94)),
  };
}

/** Maps a scroll-stage progress onto the shared eight-beat timeline. */
export function stageProgressToNarrative(progress: number): number {
  return clamp01(0.14 + clamp01(progress) * 0.86);
}
