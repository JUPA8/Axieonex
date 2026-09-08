import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { withTransitionProvider } from "./testUtils";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("MobileNavigation", () => {
  it("is hidden when closed", () => {
    render(withTransitionProvider(<MobileNavigation isOpen={false} onClose={() => {}} />));
    expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();
  });

  it("moves focus to the close button and traps it when open", async () => {
    const user = userEvent.setup();
    render(withTransitionProvider(<MobileNavigation isOpen onClose={() => {}} />));

    const closeButton = screen.getByRole("button", { name: "Close menu" });
    expect(closeButton).toHaveFocus();

    // Tabbing past the last focusable element should wrap back to the first.
    const strategyCallButton = screen.getByRole("link", { name: "Book a Strategy Call" });
    strategyCallButton.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  it("calls onClose when the close button is activated", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(withTransitionProvider(<MobileNavigation isOpen onClose={onClose} />));
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(withTransitionProvider(<MobileNavigation isOpen onClose={onClose} />));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when a nav link is activated", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(withTransitionProvider(<MobileNavigation isOpen onClose={onClose} />));
    await user.click(screen.getByRole("link", { name: "About" }));
    expect(onClose).toHaveBeenCalled();
  });
});
