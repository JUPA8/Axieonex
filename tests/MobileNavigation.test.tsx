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

  it("moves focus into the panel and traps it when open", async () => {
    const user = userEvent.setup();
    render(withTransitionProvider(<MobileNavigation isOpen onClose={() => {}} />));

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveFocus();

    // Tabbing past the last focusable element should wrap back to the first.
    const strategyCallButton = screen.getByRole("link", { name: "Book a Strategy Call" });
    strategyCallButton.focus();
    await user.tab();
    expect(links[0]).toHaveFocus();
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
