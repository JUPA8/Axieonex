import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookiePreferencesManager } from "@/components/cookie-preferences/CookiePreferencesManager";
import { readConsent } from "@/lib/consent";

describe("CookiePreferencesManager", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps the Strictly Necessary switch checked and disabled", () => {
    render(<CookiePreferencesManager />);
    const necessary = screen.getByLabelText("Strictly necessary cookies, always on");
    expect(necessary).toBeChecked();
    expect(necessary).toBeDisabled();
  });

  it("starts every optional category off by default", () => {
    render(<CookiePreferencesManager />);
    expect(screen.getByLabelText("Functional cookies")).not.toBeChecked();
    expect(screen.getByLabelText("Analytics cookies")).not.toBeChecked();
    expect(screen.getByLabelText("Marketing cookies")).not.toBeChecked();
  });

  it("Accept all persists every category as granted and announces the save", async () => {
    const user = userEvent.setup();
    render(<CookiePreferencesManager />);
    await user.click(screen.getByRole("button", { name: "Accept all" }));
    expect(readConsent()?.categories.analytics).toBe(true);
    expect(readConsent()?.categories.marketing).toBe(true);
    expect(screen.getByText("Your preferences have been saved.")).toBeInTheDocument();
  });

  it("Reject optional persists only the locked necessary category", async () => {
    const user = userEvent.setup();
    render(<CookiePreferencesManager />);
    await user.click(screen.getByLabelText("Analytics cookies"));
    await user.click(screen.getByRole("button", { name: "Reject optional" }));
    expect(readConsent()?.categories).toEqual({
      necessary: true,
      functional: false,
      analytics: false,
      preferences: false,
      marketing: false,
    });
  });

  it("toggling a switch and saving preferences persists exactly that selection", async () => {
    const user = userEvent.setup();
    render(<CookiePreferencesManager />);
    await user.click(screen.getByLabelText("Functional cookies"));
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(readConsent()?.categories.functional).toBe(true);
    expect(readConsent()?.categories.analytics).toBe(false);
  });

  it("describes analytics as unconfigured when no analytics provider is set", () => {
    render(<CookiePreferencesManager analyticsConfigured={false} />);
    expect(screen.getByText(/No analytics script is confirmed active/)).toBeInTheDocument();
  });

  it("describes the real analytics provider once one is configured", () => {
    render(<CookiePreferencesManager analyticsConfigured />);
    expect(screen.getByText(/Loads Plausible Analytics/)).toBeInTheDocument();
  });
});
