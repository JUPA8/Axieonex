import { describe, expect, it } from "vitest";
import { FORMS, FORM_IDS, type FormId } from "@/lib/motion/scene/forms";
import { BLADE_A, BLADE_B, flattenBlade, pointInPolygon } from "@/lib/motion/constellation/geometry";
import {
  createSceneField,
  layoutForms,
  particleBudget,
  settle,
  stepScene,
} from "@/lib/motion/scene/sceneField";

const W = 1440;
const H = 900;

function fill(form: FormId, count = 500) {
  const targets = new Float32Array(count * 2);
  const depth = new Float32Array(count).fill(0.5);
  FORMS[form](targets, { width: W, height: H, depth, count }, 1234);
  return targets;
}

describe("scene forms", () => {
  it("defines a filler for every declared form", () => {
    for (const id of FORM_IDS) expect(typeof FORMS[id]).toBe("function");
  });

  it("produces finite coordinates for every form", () => {
    for (const id of FORM_IDS) {
      const t = fill(id);
      for (let i = 0; i < t.length; i += 1) expect(Number.isFinite(t[i])).toBe(true);
    }
  });

  it("keeps every form within a bleed margin of the viewport", () => {
    for (const id of FORM_IDS) {
      const t = fill(id);
      for (let i = 0; i < t.length / 2; i += 1) {
        expect(t[i * 2]).toBeGreaterThan(-W);
        expect(t[i * 2]).toBeLessThan(W * 2);
        expect(t[i * 2 + 1]).toBeGreaterThan(-H);
        expect(t[i * 2 + 1]).toBeLessThan(H * 2);
      }
    }
  });

  it("builds the mark form from the canonical AXIEONEX X blades", () => {
    const count = 600;
    const t = fill("mark", count);
    const polys = [flattenBlade(BLADE_A), flattenBlade(BLADE_B)];
    const size = Math.min(W, H) * 1.02;
    const ox = W * 0.54 - size / 2;
    const oy = H * 0.5 - size / 2;
    let inside = 0;
    for (let i = 0; i < count; i += 1) {
      const p = { x: ((t[i * 2] - ox) / size) * 64, y: ((t[i * 2 + 1] - oy) / size) * 64 };
      if (polys.some((poly) => pointInPolygon(p, poly))) inside += 1;
    }
    expect(inside / count).toBeGreaterThan(0.9);
  });

  it("makes the mark large enough to be the dominant visual event", () => {
    const count = 600;
    const t = fill("mark", count);
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < count; i += 1) {
      minY = Math.min(minY, t[i * 2 + 1]);
      maxY = Math.max(maxY, t[i * 2 + 1]);
    }
    // The X must span most of the viewport height, not sit in a small box.
    expect((maxY - minY) / H).toBeGreaterThan(0.6);
  });

  it("spreads the field form across the whole frame, not one corner", () => {
    const count = 900;
    const t = fill("field", count);
    const quadrants = [0, 0, 0, 0];
    for (let i = 0; i < count; i += 1) {
      const q = (t[i * 2] > W / 2 ? 1 : 0) + (t[i * 2 + 1] > H / 2 ? 2 : 0);
      quadrants[q] += 1;
    }
    for (const q of quadrants) expect(q).toBeGreaterThan(20);
  });
});

describe("portrait scene forms", () => {
  const PW = 390;
  const PH = 844;

  function fillPortrait(form: FormId, count = 600) {
    const targets = new Float32Array(count * 2);
    const depth = new Float32Array(count).fill(0.5);
    FORMS[form](targets, { width: PW, height: PH, depth, count }, 4321);
    return targets;
  }

  it("re-composes rather than merely scaling down", () => {
    // The mass has to move out of the lower half, where the copy lives on a
    // phone, instead of sitting behind the headline.
    for (const id of ["field", "cluster", "validate", "core"] as const) {
      const t = fillPortrait(id);
      let upper = 0;
      for (let i = 0; i < 600; i += 1) if (t[i * 2 + 1] < PH * 0.5) upper += 1;
      expect(upper / 600).toBeGreaterThan(0.6);
    }
  });

  it("keeps the mark dominant at phone width", () => {
    const t = fillPortrait("mark");
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = 0; i < 600; i += 1) {
      minX = Math.min(minX, t[i * 2]);
      maxX = Math.max(maxX, t[i * 2]);
    }
    expect((maxX - minX) / PW).toBeGreaterThan(0.85);
  });

  it("rotates the orchestration sweep to run down the viewport", () => {
    const t = fillPortrait("lanes");
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 600; i += 1) {
      minY = Math.min(minY, t[i * 2 + 1]);
      maxY = Math.max(maxY, t[i * 2 + 1]);
    }
    expect((maxY - minY) / PH).toBeGreaterThan(0.9);
  });

  it("produces finite, on-stage coordinates for every portrait form", () => {
    for (const id of FORM_IDS) {
      const t = fillPortrait(id);
      for (let i = 0; i < 600; i += 1) {
        expect(Number.isFinite(t[i * 2])).toBe(true);
        expect(Number.isFinite(t[i * 2 + 1])).toBe(true);
        expect(t[i * 2]).toBeGreaterThan(-PW);
        expect(t[i * 2]).toBeLessThan(PW * 2);
        expect(t[i * 2 + 1]).toBeGreaterThan(-PH);
        expect(t[i * 2 + 1]).toBeLessThan(PH * 2);
      }
    }
  });
});

describe("scene field", () => {
  it("morphs between two forms and settles onto the destination", () => {
    const field = createSceneField(220);
    layoutForms(field, W, H);
    settle(field, "field");

    for (let i = 0; i < 160; i += 1) {
      stepScene(field, {
        from: "field",
        to: "mark",
        blend: 1,
        width: W,
        height: H,
        time: i * 16,
        pointerX: 0,
        pointerY: 0,
        intensity: 1,
      });
    }

    const targets = field.targets.mark;
    let close = 0;
    for (let i = 0; i < field.count; i += 1) {
      const dx = field.x[i] - targets[i * 2];
      const dy = field.y[i] - targets[i * 2 + 1];
      if (Math.hypot(dx, dy) < Math.min(W, H) * 0.06) close += 1;
    }
    expect(close / field.count).toBeGreaterThan(0.85);
  });

  it("emits finite, in-range render output", () => {
    const field = createSceneField(200);
    layoutForms(field, W, H);
    settle(field, "field");
    stepScene(field, {
      from: "field",
      to: "lanes",
      blend: 0.5,
      width: W,
      height: H,
      time: 500,
      pointerX: 0.4,
      pointerY: -0.2,
      intensity: 1,
    });
    for (let i = 0; i < field.count; i += 1) {
      expect(Number.isFinite(field.rx[i])).toBe(true);
      expect(Number.isFinite(field.ry[i])).toBe(true);
      expect(field.ra[i]).toBeGreaterThanOrEqual(0);
      expect(field.ra[i]).toBeLessThanOrEqual(1);
      expect(field.rs[i]).toBeGreaterThan(0);
    }
  });

  it("scales density with area and drops hard on coarse pointers", () => {
    expect(particleBudget(1440, 900, false)).toBeGreaterThan(2400);
    expect(particleBudget(1440, 900, false)).toBeLessThanOrEqual(3600);
    expect(particleBudget(390, 844, true)).toBeGreaterThan(1000);
    expect(particleBudget(390, 844, true)).toBeLessThanOrEqual(1500);
    expect(particleBudget(8000, 4000, false)).toBeLessThanOrEqual(3600);
  });
});
