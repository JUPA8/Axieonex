import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { StickyNarrative } from "@/components/home/StickyNarrative";
import { SCENES_CHANGED_EVENT } from "@/lib/motion/scene/sceneEngine";

const BEAT_TITLES = ["Detection", "Orchestration", "Qualified conversation"];

function mockMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion") ? reduced : false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
}

/** Frames the component queued through requestAnimationFrame. */
const frames: FrameRequestCallback[] = [];

/** Puts the pinned track at a given fraction of its own scroll distance. */
function scrollPinTo(progress: number) {
  const track = document.querySelector<HTMLElement>('[data-sticky-narrative="pinned"]');
  if (!track) throw new Error("expected the pinned track");
  const trackHeight = window.innerHeight * 3.6;
  const span = trackHeight - window.innerHeight;
  track.getBoundingClientRect = () =>
    ({ top: -progress * span, height: trackHeight }) as DOMRect;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
    // The component reads layout on the next frame, never in the listener.
    const queued = frames.splice(0, frames.length);
    for (const frame of queued) frame(0);
  });
}

describe("StickyNarrative", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    window.innerWidth = 1440;
    window.innerHeight = 900;
    // jsdom has no paint loop, so queue frames and let the helpers flush them.
    frames.length = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pins once hydrated and lays every stage out over the pin distance", () => {
    render(<StickyNarrative />);
    const track = document.querySelector<HTMLElement>('[data-sticky-narrative="pinned"]');
    expect(track).not.toBeNull();
    expect(track?.style.height).toBe("360vh");

    const markers = Array.from(track!.querySelectorAll<HTMLElement>("[data-scene]"));
    expect(markers.map((m) => m.getAttribute("data-scene"))).toEqual([
      "scan",
      "lanes",
      "validate",
      "mark",
      "core",
    ]);

    // Markers must tile the pin without a gap, offset half a viewport down,
    // because the engine reads a stage as current from the viewport midpoint.
    const pin = 360 - 100;
    let expectedTop = 50;
    for (const marker of markers) {
      expect(marker.style.top).toBe(`${expectedTop}vh`);
      expectedTop += Number.parseFloat(marker.style.height);
    }
    expect(expectedTop).toBeCloseTo(50 + pin, 5);
  });

  it("advances the copy through the three beats as the pin progresses, and never restarts", () => {
    render(<StickyNarrative />);
    const current = () =>
      document.querySelector('.ax-pin-beat[data-state="current"] h2')?.textContent;

    scrollPinTo(0);
    expect(current()).toBe("Detection");
    scrollPinTo(0.2);
    expect(current()).toBe("Detection");
    scrollPinTo(0.45);
    expect(current()).toBe("Orchestration");
    scrollPinTo(0.75);
    expect(current()).toBe("Qualified conversation");
    // Past the release point the last beat holds rather than resetting to the first.
    scrollPinTo(1.4);
    expect(current()).toBe("Qualified conversation");
  });

  it("keeps passed stages visible on the rail as context", () => {
    render(<StickyNarrative />);
    scrollPinTo(0.45);
    const rail = Array.from(document.querySelectorAll<HTMLElement>(".ax-pin-rail li"));
    expect(rail.map((li) => li.dataset.state)).toEqual(["past", "current", "ahead"]);
    expect(rail[0].textContent).toContain("Intent isolated from noise");
    expect(rail[1].textContent).toContain("Orchestration");
  });

  it("keeps the whole sequence in the accessibility tree while pinned", () => {
    render(<StickyNarrative />);
    for (const title of BEAT_TITLES) {
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    }
  });

  it("shortens the pinned run on a phone instead of reusing the desktop distance", () => {
    window.innerWidth = 390;
    window.innerHeight = 844;
    render(<StickyNarrative />);
    const track = document.querySelector<HTMLElement>('[data-sticky-narrative="pinned"]');
    expect(track?.style.height).toBe("250vh");
    const markers = Array.from(track!.querySelectorAll<HTMLElement>("[data-scene]"));
    const total = markers.reduce((sum, m) => sum + Number.parseFloat(m.style.height), 0);
    expect(total).toBeCloseTo(250 - 100, 5);
  });

  it("falls back to three plain readable sections under reduced motion", () => {
    mockMatchMedia(true);
    render(<StickyNarrative />);
    expect(document.querySelector('[data-sticky-narrative="pinned"]')).toBeNull();
    const list = document.querySelector<HTMLElement>('[data-sticky-narrative="static"]');
    expect(list).not.toBeNull();

    const items = Array.from(list!.querySelectorAll("li"));
    expect(items).toHaveLength(3);
    expect(items.map((li) => li.getAttribute("data-scene"))).toEqual(["scan", "lanes", "validate"]);
    for (const title of BEAT_TITLES) {
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    }
    // No scroll binding at all: nothing is hidden behind a scroll position.
    expect(document.querySelector(".ax-pin-beat")).toBeNull();
  });

  it("tells the shared environment to re-read its stages when the layout changes", () => {
    const seen: Event[] = [];
    const listener = (event: Event) => seen.push(event);
    window.addEventListener(SCENES_CHANGED_EVENT, listener);
    render(<StickyNarrative />);
    window.removeEventListener(SCENES_CHANGED_EVENT, listener);
    expect(seen.length).toBeGreaterThan(0);
  });

  it("removes its scroll listeners on unmount", () => {
    const removed: string[] = [];
    const original = window.removeEventListener.bind(window);
    vi.spyOn(window, "removeEventListener").mockImplementation((type, ...rest) => {
      removed.push(String(type));
      return original(type, ...(rest as [EventListenerOrEventListenerObject]));
    });
    const { unmount } = render(<StickyNarrative />);
    unmount();
    expect(removed).toContain("scroll");
    expect(removed).toContain("resize");
  });
});
