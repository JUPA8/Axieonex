import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ALL_ACCEPTED_CONSENT,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT,
  hasConsentFor,
  readConsent,
  syncConsentFromServer,
  writeConsent,
} from "@/lib/consent";

describe("consent storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(global.fetch).mockClear();
  });

  it("returns null when nothing has been saved", () => {
    expect(readConsent()).toBeNull();
  });

  it("round-trips a written consent record", async () => {
    await writeConsent(ALL_ACCEPTED_CONSENT);
    const stored = readConsent();
    expect(stored?.categories).toEqual(ALL_ACCEPTED_CONSENT);
    expect(stored?.version).toBe(1);
  });

  it("always forces necessary to true even if a caller tries to disable it", async () => {
    await writeConsent({ ...DEFAULT_CONSENT, necessary: false as unknown as true });
    expect(readConsent()?.categories.necessary).toBe(true);
  });

  it("hasConsentFor reflects the stored category and defaults closed when nothing is stored", async () => {
    expect(hasConsentFor("analytics")).toBe(false);
    await writeConsent(ALL_ACCEPTED_CONSENT);
    expect(hasConsentFor("analytics")).toBe(true);
  });

  it("ignores a stored record from a stale consent version", () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: 0, categories: ALL_ACCEPTED_CONSENT, updatedAt: new Date().toISOString() }),
    );
    expect(readConsent()).toBeNull();
  });

  it("writeConsent posts the chosen categories to the server as the durable copy", async () => {
    await writeConsent(ALL_ACCEPTED_CONSENT);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/consent",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ categories: { ...ALL_ACCEPTED_CONSENT, necessary: true } }),
      }),
    );
  });

  it("writeConsent keeps the local choice even if the server write fails", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("network down"));
    await writeConsent(ALL_ACCEPTED_CONSENT);
    expect(readConsent()?.categories).toEqual(ALL_ACCEPTED_CONSENT);
  });

  it("syncConsentFromServer does nothing when a local choice already exists", async () => {
    await writeConsent(ALL_ACCEPTED_CONSENT);
    vi.mocked(global.fetch).mockClear();
    await syncConsentFromServer();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("syncConsentFromServer adopts the server's record when the local cache is empty", async () => {
    const serverRecord = {
      version: 1,
      categories: ALL_ACCEPTED_CONSENT,
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ record: serverRecord }), { status: 200 }),
    );
    await syncConsentFromServer();
    expect(readConsent()?.categories).toEqual(ALL_ACCEPTED_CONSENT);
  });

  it("syncConsentFromServer leaves the cache empty when the server has no record", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ record: null }), { status: 200 }));
    await syncConsentFromServer();
    expect(readConsent()).toBeNull();
  });
});
