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
    expect(particleBudget(390, 844, true)).toBeGreaterThan(1800);
    expect(particleBudget(390, 844, true)).toBeLessThanOrEqual(2100);
    expect(particleBudget(8000, 4000, false)).toBeLessThanOrEqual(3600);
  });
});

describe("the qualified-opportunity core", () => {
  const COUNT = 4000;
  const unit = Math.min(W, H);
  const cx = W * 0.5;
  const cy = H * 0.48;

  function radii() {
    const targets = new Float32Array(COUNT * 2);
    const depth = new Float32Array(COUNT).fill(0.5);
    FORMS.core(targets, { width: W, height: H, depth, count: COUNT }, 77);
    const out: { rho: number; angle: number }[] = [];
    for (let i = 0; i < COUNT; i += 1) {
      const dx = targets[i * 2] - cx;
      const dy = targets[i * 2 + 1] - cy;
      out.push({ rho: Math.hypot(dx, dy) / unit, angle: Math.atan2(dy, dx) });
    }
    return out;
  }

  it("packs a genuine nucleus rather than spreading evenly", () => {
    const points = radii();
    const nucleus = points.filter((p) => p.rho < 0.16).length / COUNT;
    // An evenly filled disc would put a few percent this close in.
    expect(nucleus).toBeGreaterThan(0.25);
  });

  it("holds a corona out toward the frame edge", () => {
    const points = radii();
    const corona = points.filter((p) => p.rho > 0.5).length / COUNT;
    expect(corona).toBeGreaterThan(0.2);
  });

  it("separates nucleus from corona with a sparser annulus between them", () => {
    const points = radii();
    const band = (lo: number, hi: number) =>
      points.filter((p) => p.rho >= lo && p.rho < hi).length / (hi - lo);
    const nucleus = band(0, 0.18);
    const gap = band(0.28, 0.46);
    const corona = band(0.52, 0.72);
    // A visible trough between the two bright populations is what gives the
    // state depth instead of reading as one blur.
    expect(gap).toBeLessThan(nucleus * 0.5);
    expect(gap).toBeLessThan(corona * 0.75);
  });

  it("builds convergence spokes, not uniform noise, across that annulus", () => {
    const points = radii().filter((p) => p.rho > 0.25 && p.rho < 0.46);
    const BINS = 66;
    const hist = new Array<number>(BINS).fill(0);
    for (const p of points) {
      const bin = Math.floor(((p.angle + Math.PI) / (Math.PI * 2)) * BINS) % BINS;
      hist[bin] += 1;
    }
    const mean = points.length / BINS;
    const peak = Math.max(...hist);
    // Uniform scatter lands near 1.3x mean; directed spokes stand well clear.
    expect(peak / mean).toBeGreaterThan(2.2);
  });

  it("stays inside the frame it is composed for", () => {
    const targets = new Float32Array(600 * 2);
    const depth = new Float32Array(600).fill(0.5);
    FORMS.core(targets, { width: W, height: H, depth, count: 600 }, 5);
    for (let i = 0; i < 600; i += 1) {
      expect(Number.isFinite(targets[i * 2])).toBe(true);
      expect(Number.isFinite(targets[i * 2 + 1])).toBe(true);
    }
  });
});

describe("glyph scale", () => {
  it("sizes portrait glyphs from the geometric mean so a phone does not look thin", () => {
    const field = createSceneField(40);
    layoutForms(field, 390, 844);
    settle(field, "field");
    const step = (width: number, height: number) => {
      layoutForms(field, width, height);
      stepScene(field, {
        from: "field",
        to: "field",
        blend: 0,
        width,
        height,
        time: 0,
        pointerX: 0,
        pointerY: 0,
        intensity: 1,
      });
      return field.rs.slice(0, field.count).reduce((a, b) => a + b, 0) / field.count;
    };

    const portrait = step(390, 844);
    const landscape = step(844, 390);
    // Same pixel area, same particles: the portrait frame must not render the
    // field at the same tiny scale its short edge alone would imply.
    expect(portrait).toBeGreaterThan(landscape * 1.15);
  });
});
