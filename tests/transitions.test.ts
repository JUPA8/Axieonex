import { describe, expect, it } from "vitest";
import { destinationFilter, getDestinationForPath, isNativeHref, isPlainLeftClick } from "@/lib/transitions";
import type { MouseEvent } from "react";

function mouseEvent(overrides: Partial<MouseEvent> = {}): MouseEvent {
  return {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  } as MouseEvent;
}

describe("isPlainLeftClick", () => {
  it("accepts an unmodified left click", () => {
    expect(isPlainLeftClick(mouseEvent())).toBe(true);
  });

  it("rejects modified clicks", () => {
    expect(isPlainLeftClick(mouseEvent({ metaKey: true }))).toBe(false);
    expect(isPlainLeftClick(mouseEvent({ ctrlKey: true }))).toBe(false);
    expect(isPlainLeftClick(mouseEvent({ shiftKey: true }))).toBe(false);
    expect(isPlainLeftClick(mouseEvent({ altKey: true }))).toBe(false);
    expect(isPlainLeftClick(mouseEvent({ button: 1 }))).toBe(false);
    expect(isPlainLeftClick(mouseEvent({ defaultPrevented: true }))).toBe(false);
  });
});

describe("isNativeHref", () => {
  it("treats in-page anchors, mailto, tel, and external protocols as native", () => {
    expect(isNativeHref("#section")).toBe(true);
    expect(isNativeHref("mailto:info@axieonexsales.net")).toBe(true);
    expect(isNativeHref("tel:+15550100")).toBe(true);
    expect(isNativeHref("https://example.com")).toBe(true);
  });

  it("treats internal app routes as non-native", () => {
    expect(isNativeHref("/about")).toBe(false);
    expect(isNativeHref("/services/lead-generation")).toBe(false);
  });
});

describe("getDestinationForPath", () => {
  it("resolves known static routes", () => {
    expect(getDestinationForPath("/about").label).toBe("pearl and silver reveal");
    expect(getDestinationForPath("/pricing").label).toBe("graphite and platinum");
  });

  it("resolves per-service destinations for /services/[slug]", () => {
    expect(getDestinationForPath("/services/cold-email").label).toContain("message path folding");
    expect(getDestinationForPath("/services/unknown-slug")).toEqual(getDestinationForPath("/services"));
  });

  it("resolves every /insights/[slug] article to the shared typographic-line signature", () => {
    expect(getDestinationForPath("/insights/any-article").label).toBe("typographic line");
  });

  it("falls back to a default signature for unknown paths", () => {
    expect(getDestinationForPath("/does-not-exist").label).toBe("default");
  });
});

describe("destinationFilter", () => {
  it("builds a CSS filter string from a signature", () => {
    expect(destinationFilter({ hue: 10, sat: 1.2, bri: 0.9, label: "x" })).toBe("hue-rotate(10deg) saturate(1.2) brightness(0.9)");
  });
});
