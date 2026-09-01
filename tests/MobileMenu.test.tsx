import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { DemoModalProvider } from "@/features/contact/DemoModalContext";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

function renderMenu() {
  return render(
    <DemoModalProvider>
      <MobileMenu />
    </DemoModalProvider>
  );
}

describe("MobileMenu", () => {
  it("is closed by default", () => {
    renderMenu();
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();
  });

  it("opens and shows all primary + service links", async () => {
    renderMenu();
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About Axieonex" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lead Generation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("closes when the route changes", async () => {
    mockPathname = "/";
    const { rerender } = renderMenu();
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();

    mockPathname = "/pricing";
    rerender(
      <DemoModalProvider>
        <MobileMenu />
      </DemoModalProvider>
    );
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();
  });
});
