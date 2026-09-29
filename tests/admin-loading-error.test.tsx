import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ captureException: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureException: mocks.captureException }));

import AdminError from "@/app/admin/(dashboard)/error";
import AdminLoading from "@/app/admin/(dashboard)/loading";

describe("admin loading and error states", () => {
  it("announces a protected loading state without record data", () => {
    render(<AdminLoading />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("heading", { level: 1, name: "Loading administration data" })).toBeInTheDocument();
  });

  it("announces a generic failure, captures it privately, and exposes a keyboard-operable retry", () => {
    const retry = vi.fn();
    const error = new Error("password=secret database.internal sensitive-row-content");
    render(<AdminError error={error} retry={retry} />);

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByRole("heading", { level: 1, name: "Administration data could not be loaded" })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(error.message);
    expect(mocks.captureException).toHaveBeenCalledWith(error);

    const retryButton = screen.getByRole("button", { name: "Try again" });
    retryButton.focus();
    fireEvent.keyDown(retryButton, { key: "Enter" });
    fireEvent.click(retryButton);
    expect(retry).toHaveBeenCalledOnce();
  });
});
