import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { BrandMark } from "@/components/brand/BrandMark";
import {
  BLADE_A,
  BLADE_B,
  createRng,
  flattenBlade,
  pointInPolygon,
  projectToBox,
  sampleXInterior,
  toPathD,
  X_VIEWBOX,
} from "@/lib/motion/constellation/geometry";

describe("constellation geometry", () => {
  it("stays byte-identical to the X geometry BrandMark actually renders", () => {
    const { container } = render(<BrandMark />);
    const rendered = Array.from(container.querySelectorAll("path")).map((path) => path.getAttribute("d"));
    expect(rendered).toEqual([toPathD(BLADE_A), toPathD(BLADE_B)]);
  });

  it("flattens each blade into a closed polygon", () => {
    const polygon = flattenBlade(BLADE_A, 8);
    expect(polygon.length).toBe(BLADE_A.segments.length * 8 + 1);
    expect(polygon[0]).toEqual({ x: BLADE_A.x, y: BLADE_A.y });
    const last = polygon[polygon.length - 1];
    expect(last.x).toBeCloseTo(BLADE_A.x, 6);
    expect(last.y).toBeCloseTo(BLADE_A.y, 6);
  });

  it("detects interior and exterior points", () => {
    const polygon = flattenBlade(BLADE_A);
    expect(pointInPolygon({ x: 0.5, y: 0.5 }, polygon)).toBe(false);
    expect(pointInPolygon({ x: 63, y: 63 }, polygon)).toBe(false);
  });

  it("samples only points that fall inside one of the two blades", () => {
    const points = sampleXInterior(220);
    expect(points.length).toBe(220);
    const polygons = [flattenBlade(BLADE_A), flattenBlade(BLADE_B)];
    for (const point of points) {
      expect(polygons.some((polygon) => pointInPolygon(point, polygon))).toBe(true);
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(X_VIEWBOX);
    }
  });

  it("covers both blades rather than collapsing onto one", () => {
    const points = sampleXInterior(400);
    const inA = points.filter((p) => pointInPolygon(p, flattenBlade(BLADE_A))).length;
    const inB = points.filter((p) => pointInPolygon(p, flattenBlade(BLADE_B))).length;
    expect(inA).toBeGreaterThan(40);
    expect(inB).toBeGreaterThan(40);
  });

  it("is deterministic for a given seed so the mark never reshuffles", () => {
    expect(sampleXInterior(64, 99)).toEqual(sampleXInterior(64, 99));
  });

  it("projects into a centred, aspect-correct box", () => {
    const projected = projectToBox([{ x: 32, y: 32 }], 800, 400, 0.8);
    expect(projected[0].x).toBeCloseTo(400, 6);
    expect(projected[0].y).toBeCloseTo(200, 6);
  });

  it("produces a stable pseudo-random stream in 0..1", () => {
    const rng = createRng(7);
    const values = Array.from({ length: 200 }, () => rng());
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    expect(createRng(7)()).toBe(values[0]);
  });
});
