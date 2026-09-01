import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders a native button and fires onClick when no href is given", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    const el = screen.getByRole("button", { name: "Click me" });
    await userEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a link when href is given", () => {
    render(<Button href="/pricing">Go to pricing</Button>);
    const link = screen.getByRole("link", { name: "Go to pricing" });
    expect(link).toHaveAttribute("href", "/pricing");
  });

  it("does not leak internal props onto the DOM", () => {
    render(<Button variant="outline">Test</Button>);
    const el = screen.getByRole("button", { name: "Test" });
    expect(el).not.toHaveAttribute("variant");
  });
});
