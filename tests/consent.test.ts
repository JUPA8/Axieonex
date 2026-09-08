import { beforeEach, describe, expect, it } from "vitest";
import { ALL_ACCEPTED_CONSENT, DEFAULT_CONSENT, hasConsentFor, readConsent, writeConsent } from "@/lib/consent";

describe("consent storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing has been saved", () => {
    expect(readConsent()).toBeNull();
  });

  it("round-trips a written consent record", () => {
    writeConsent(ALL_ACCEPTED_CONSENT);
    const stored = readConsent();
    expect(stored?.categories).toEqual(ALL_ACCEPTED_CONSENT);
    expect(stored?.version).toBe(1);
  });

  it("always forces necessary to true even if a caller tries to disable it", () => {
    writeConsent({ ...DEFAULT_CONSENT, necessary: false as unknown as true });
    expect(readConsent()?.categories.necessary).toBe(true);
  });

  it("hasConsentFor reflects the stored category and defaults closed when nothing is stored", () => {
    expect(hasConsentFor("analytics")).toBe(false);
    writeConsent(ALL_ACCEPTED_CONSENT);
    expect(hasConsentFor("analytics")).toBe(true);
  });

  it("ignores a stored record from a stale consent version", () => {
    window.localStorage.setItem(
      "axieonex-cookie-consent",
      JSON.stringify({ version: 0, categories: ALL_ACCEPTED_CONSENT, updatedAt: new Date().toISOString() }),
    );
    expect(readConsent()).toBeNull();
  });
});
