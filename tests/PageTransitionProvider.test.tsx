import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";

describe("PageTransitionProvider focus management", () => {
  beforeEach(() => {
    pathname = "/";
    document.body.focus();
  });

  it("preserves the document's initial tab order and focuses main only after navigation", async () => {
    const view = render(
      <PageTransitionProvider>
        <a href="#main-content">Skip to content</a>
        <main id="main-content">Page content</main>
      </PageTransitionProvider>,
    );

    expect(document.activeElement).toBe(document.body);

    pathname = "/about";
    view.rerender(
      <PageTransitionProvider>
        <a href="#main-content">Skip to content</a>
        <main id="main-content">About content</main>
      </PageTransitionProvider>,
    );

    await waitFor(() => expect(document.querySelector("#main-content")).toHaveFocus());
  });
});
