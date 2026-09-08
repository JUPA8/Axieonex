import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { withTransitionProvider } from "./testUtils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/services",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("SiteHeader", () => {
  it("always shows a Contact link alongside the primary nav", () => {
    render(withTransitionProvider(<SiteHeader />));
    const contactLinks = screen.getAllByRole("link", { name: "Contact" });
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it("marks the current route as aria-current", () => {
    render(withTransitionProvider(<SiteHeader />));
    const activeLinks = screen.getAllByRole("link", { name: "Services" }).filter((el) => el.getAttribute("aria-current") === "page");
    expect(activeLinks.length).toBeGreaterThan(0);
  });

  it("always renders the Book a Strategy Call CTA", () => {
    render(withTransitionProvider(<SiteHeader />));
    expect(screen.getAllByRole("link", { name: "Book a Strategy Call" }).length).toBeGreaterThan(0);
  });

  it("has an accessible menu toggle button for the mobile breakpoint", () => {
    render(withTransitionProvider(<SiteHeader />));
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });
});
