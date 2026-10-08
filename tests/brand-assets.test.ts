import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

const root = resolve(__dirname, "..");
const read = (rel: string) => readFileSync(resolve(root, rel));

/** Width and height straight out of the PNG IHDR chunk. */
function pngSize(rel: string): { width: number; height: number } {
  const buf = read(rel);
  expect(buf.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  expect(buf.subarray(12, 16).toString("ascii")).toBe("IHDR");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** The (width, height) pairs an ICO's directory advertises; 0 means 256. */
function icoSizes(rel: string): [number, number][] {
  const buf = read(rel);
  expect(buf.readUInt16LE(0)).toBe(0);
  expect(buf.readUInt16LE(2)).toBe(1); // 1 = icon, not cursor
  const count = buf.readUInt16LE(4);
  return Array.from({ length: count }, (_, i) => {
    const entry = 6 + i * 16;
    return [buf[entry] || 256, buf[entry + 1] || 256] as [number, number];
  });
}

describe("launch icon assets", () => {
  it("ships every icon the metadata and manifest reference, at the declared size", () => {
    expect(pngSize("src/app/icon.png")).toEqual({ width: 512, height: 512 });
    expect(pngSize("src/app/apple-icon.png")).toEqual({ width: 180, height: 180 });
    expect(pngSize("public/icons/icon-192.png")).toEqual({ width: 192, height: 192 });
    expect(pngSize("public/icons/icon-512.png")).toEqual({ width: 512, height: 512 });
    expect(pngSize("public/icons/icon-maskable-512.png")).toEqual({ width: 512, height: 512 });
  });

  it("keeps the legacy favicon.ico carrying the small sizes browsers still ask for", () => {
    const sizes = icoSizes("src/app/favicon.ico");
    expect(sizes).toEqual(expect.arrayContaining([[16, 16], [32, 32], [48, 48]]));
  });

  it("renders the link-preview card at the 1.91:1 size the social platforms expect", () => {
    expect(pngSize("src/app/opengraph-image.png")).toEqual({ width: 1200, height: 630 });
    expect(pngSize("src/app/twitter-image.png")).toEqual({ width: 1200, height: 630 });
  });

  it("gives both preview images alt text", () => {
    for (const rel of ["src/app/opengraph-image.alt.txt", "src/app/twitter-image.alt.txt"]) {
      expect(read(rel).toString("utf8").trim().length).toBeGreaterThan(20);
    }
  });
});

describe("web manifest", () => {
  const value = manifest();

  it("identifies the site with the exact brand spelling", () => {
    expect(value.short_name).toBe("AXIEONEX");
    expect(value.name).toContain("AXIEONEX");
    expect(value.description).toBeTruthy();
  });

  it("installs from the site root on the site's own field colour", () => {
    expect(value.start_url).toBe("/");
    expect(value.scope).toBe("/");
    expect(value.display).toBe("standalone");
    expect(value.background_color).toBe("#000000");
    expect(value.theme_color).toBe("#000000");
  });

  it("declares 192, 512, and a maskable 512 so Android never crops into the mark", () => {
    const icons = value.icons ?? [];
    expect(icons.map((icon) => icon.sizes)).toEqual(["192x192", "512x512", "512x512"]);
    expect(icons.every((icon) => icon.type === "image/png")).toBe(true);
    expect(icons.filter((icon) => icon.purpose === "maskable")).toHaveLength(1);
    expect(icons.filter((icon) => icon.purpose === "any")).toHaveLength(2);
  });

  it("points every icon at a file that exists", () => {
    for (const icon of value.icons ?? []) {
      expect(() => read(`public${icon.src}`)).not.toThrow();
    }
  });
});
