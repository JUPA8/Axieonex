import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ConstellationCanvas } from "@/components/motion/ConstellationCanvas";

function stubContext() {
  const gradient = { addColorStop: vi.fn() };
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    createLinearGradient: vi.fn(() => gradient),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

const originalGetContext = HTMLCanvasElement.prototype.getContext;

describe("ConstellationCanvas", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders a decorative canvas that screen readers ignore", () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(stubContext) as unknown as typeof originalGetContext;
    const { container } = render(<ConstellationCanvas mode="hero" className="test-canvas" />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("data-constellation", "hero");
  });

  it("falls back to the static AXIEONEX mark when 2D canvas is unavailable", () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof originalGetContext;
    const { container } = render(<ConstellationCanvas mode="hero" />);
    expect(container.querySelector("canvas")).toBeNull();
    const fallback = container.querySelector('[data-constellation="fallback"]');
    expect(fallback).not.toBeNull();
    expect(fallback).toHaveAttribute("aria-hidden", "true");
    expect(fallback?.querySelector("svg")).not.toBeNull();
  });

  it("releases every frame, observer and listener on unmount", () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(stubContext) as unknown as typeof originalGetContext;
    const cancelFrame = vi.spyOn(window, "cancelAnimationFrame");
    const removeWindowListener = vi.spyOn(window, "removeEventListener");
    const removeDocumentListener = vi.spyOn(document, "removeEventListener");

    const { unmount } = render(<ConstellationCanvas mode="hero" />);
    unmount();

    expect(cancelFrame).toHaveBeenCalled();
    expect(removeDocumentListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(removeWindowListener).toHaveBeenCalledWith("pointermove", expect.any(Function));
  });

  it("marks the canvas as reduced-motion when the user prefers it", () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(stubContext) as unknown as typeof originalGetContext;
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const { container } = render(<ConstellationCanvas mode="hero" />);
    expect(container.querySelector("canvas")).toHaveAttribute("data-reduced-motion", "true");
  });
});
