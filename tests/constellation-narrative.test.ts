import { describe, expect, it } from "vitest";
import {
  BEATS,
  clamp01,
  narrativeAt,
  ramp,
  stageProgressToNarrative,
  stageWeights,
} from "@/lib/motion/constellation/narrative";

describe("constellation narrative", () => {
  it("covers the timeline contiguously from 0 to 1", () => {
    expect(BEATS[0].start).toBe(0);
    expect(BEATS[BEATS.length - 1].end).toBe(1);
    BEATS.forEach((beat, i) => {
      if (i === 0) return;
      expect(beat.start).toBe(BEATS[i - 1].end);
    });
  });

  it("clamps and ramps within bounds", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(3)).toBe(1);
    expect(ramp(0.5, 0.5, 1)).toBe(0);
    expect(ramp(1, 0.5, 1)).toBe(1);
    expect(ramp(0.75, 0.5, 1)).toBeCloseTo(0.5, 6);
  });

  it("tells the story in order: nothing is active before its beat", () => {
    const early = narrativeAt(0.05);
    expect(early.classification).toBe(0);
    expect(early.orchestration).toBe(0);
    expect(early.convergence).toBe(0);
    expect(early.resolution).toBe(0);

    const midway = narrativeAt(0.6);
    expect(midway.classification).toBe(1);
    expect(midway.noiseFade).toBe(1);
    expect(midway.orchestration).toBeGreaterThan(0);
    expect(midway.convergence).toBe(0);

    const end = narrativeAt(1);
    expect(end.convergence).toBe(1);
    expect(end.resolution).toBe(1);
  });

  it("only sweeps during the detection beat", () => {
    expect(narrativeAt(0.05).scanX).toBe(-1);
    expect(narrativeAt(0.22).scanX).toBeGreaterThan(0);
    expect(narrativeAt(0.9).scanX).toBe(-1);
  });

  it("keeps every channel of the state within 0..1 across the timeline", () => {
    for (let step = 0; step <= 100; step += 1) {
      const state = narrativeAt(step / 100);
      for (const [key, value] of Object.entries(state)) {
        if (key === "scanX") continue;
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });

  it("clamps out-of-range progress instead of extrapolating", () => {
    expect(narrativeAt(-5)).toEqual(narrativeAt(0));
    expect(narrativeAt(5)).toEqual(narrativeAt(1));
  });

  it("keeps earlier stages partially lit so the section reads as one system", () => {
    const end = stageWeights(1);
    expect(end.qualified).toBeCloseTo(1, 5);
    expect(end.detection).toBeGreaterThan(0.3);
    expect(end.orchestration).toBeGreaterThan(0);

    const start = stageWeights(0);
    expect(start.detection).toBeCloseTo(1, 5);
    expect(start.qualified).toBe(0);
  });

  it("maps scroll progress onto the timeline starting at detection", () => {
    expect(stageProgressToNarrative(0)).toBeCloseTo(0.14, 6);
    expect(stageProgressToNarrative(1)).toBe(1);
  });
});
