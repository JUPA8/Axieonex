import { describe, expect, it } from "vitest";
import { particleBudget } from "@/lib/motion/constellation/engine";
import { CHANNELS, createField, ROLE_NOISE, stepField } from "@/lib/motion/constellation/field";
import { flattenBlade, pointInPolygon, BLADE_A, BLADE_B, X_VIEWBOX } from "@/lib/motion/constellation/geometry";
import { narrativeAt } from "@/lib/motion/constellation/narrative";

const SIZE = { width: 900, height: 500 };
const NO_POINTER = { x: 0, y: 0, strength: 0 };

function step(progress: number, time = 0) {
  const field = createField({ count: 300 });
  stepField(field, { ...SIZE, time, narrative: narrativeAt(progress), pointer: NO_POINTER });
  return field;
}

describe("constellation field", () => {
  it("allocates every attribute array at the requested length", () => {
    const field = createField({ count: 128 });
    expect(field.count).toBe(128);
    expect(field.renderX).toHaveLength(128);
    expect(field.unitX).toHaveLength(128);
    expect(field.role).toHaveLength(128);
  });

  it("assigns all three roles and valid channels", () => {
    const field = createField({ count: 600 });
    const roles = new Set(Array.from(field.role));
    expect(roles.size).toBe(3);
    for (const channel of field.channel) {
      expect(channel).toBeLessThan(CHANNELS.length);
    }
  });

  it("produces finite, on-canvas values across the whole timeline", () => {
    for (let s = 0; s <= 20; s += 1) {
      const field = step(s / 20, s * 100);
      for (let i = 0; i < field.count; i += 1) {
        expect(Number.isFinite(field.renderX[i])).toBe(true);
        expect(Number.isFinite(field.renderY[i])).toBe(true);
        expect(field.renderA[i]).toBeGreaterThanOrEqual(0);
        expect(field.renderA[i]).toBeLessThanOrEqual(1);
        expect(field.renderR[i]).toBeGreaterThan(0);
      }
    }
  });

  it("fades filtered noise out while signals stay visible", () => {
    const field = step(0.5);
    let noiseAlpha = 0;
    let noiseCount = 0;
    let signalAlpha = 0;
    let signalCount = 0;
    for (let i = 0; i < field.count; i += 1) {
      if (field.role[i] === ROLE_NOISE) {
        noiseAlpha += field.renderA[i];
        noiseCount += 1;
      } else {
        signalAlpha += field.renderA[i];
        signalCount += 1;
      }
    }
    expect(noiseAlpha / noiseCount).toBeLessThan(0.02);
    expect(signalAlpha / signalCount).toBeGreaterThan(0.15);
  });

  it("converges surviving signals onto the AXIEONEX X", () => {
    const field = step(1);
    const polygons = [flattenBlade(BLADE_A), flattenBlade(BLADE_B)];
    const markSize = Math.min(SIZE.width, SIZE.height) * field.markScale;
    const originX = (SIZE.width - markSize) / 2;
    const originY = (SIZE.height - markSize) / 2;

    let inside = 0;
    let signals = 0;
    for (let i = 0; i < field.count; i += 1) {
      if (field.role[i] === ROLE_NOISE) continue;
      signals += 1;
      const point = {
        x: ((field.renderX[i] - originX) / markSize) * X_VIEWBOX,
        y: ((field.renderY[i] - originY) / markSize) * X_VIEWBOX,
      };
      if (polygons.some((polygon) => pointInPolygon(point, polygon))) inside += 1;
    }
    expect(signals).toBeGreaterThan(50);
    expect(inside / signals).toBeGreaterThan(0.9);
  });

  it("leaves the assembled mark centred regardless of canvas aspect ratio", () => {
    const wide = createField({ count: 200 });
    stepField(wide, { width: 1600, height: 400, time: 0, narrative: narrativeAt(1), pointer: NO_POINTER });
    let sum = 0;
    let n = 0;
    for (let i = 0; i < wide.count; i += 1) {
      if (wide.role[i] === ROLE_NOISE) continue;
      sum += wide.renderX[i];
      n += 1;
    }
    expect(sum / n).toBeGreaterThan(700);
    expect(sum / n).toBeLessThan(900);
  });

  it("scales the intensity of the whole field", () => {
    const field = createField({ count: 120 });
    stepField(field, { ...SIZE, time: 0, narrative: narrativeAt(1), pointer: NO_POINTER, intensity: 0 });
    for (let i = 0; i < field.count; i += 1) {
      expect(field.renderA[i]).toBe(0);
    }
  });

  it("keeps the particle budget bounded and lower on coarse pointers", () => {
    expect(particleBudget(1440, 620, false)).toBeGreaterThan(400);
    expect(particleBudget(1440, 620, false)).toBeLessThanOrEqual(1600);
    expect(particleBudget(390, 320, true)).toBeLessThanOrEqual(520);
    expect(particleBudget(6000, 4000, false)).toBeLessThanOrEqual(1600);
    expect(particleBudget(10, 10, false)).toBeGreaterThanOrEqual(160);
  });
});
