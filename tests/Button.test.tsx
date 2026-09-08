import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { withTransitionProvider } from "./testUtils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Button", () => {
  it("renders a native <button> when given no href", () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders a plain external anchor with target=_blank for an external href", () => {
    render(<Button href="https://example.com" external>Visit</Button>);
    const link = screen.getByRole("link", { name: "Visit" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("renders an internal link for an app-relative href", () => {
    render(withTransitionProvider(<Button href="/book-strategy-call">Book a strategy call</Button>));
    const link = screen.getByRole("link", { name: "Book a strategy call" });
    expect(link).toHaveAttribute("href", "/book-strategy-call");
  });

  it("meets the 44px minimum touch target via its base classes", () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("min-h-11");
  });
});
