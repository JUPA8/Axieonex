import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Server Actions/components that call fetch("/api/consent") would otherwise
// attempt a real network request against jsdom's fake origin during tests.
// Individual test files can override this with their own vi.fn() when they
// need to assert on the call.
global.fetch = vi.fn(() =>
  Promise.resolve(new Response(JSON.stringify({ record: null }), { status: 200, headers: { "Content-Type": "application/json" } })),
) as unknown as typeof fetch;

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
}

if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}
