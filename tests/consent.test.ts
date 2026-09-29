import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ALL_ACCEPTED_CONSENT,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT,
  hasConsentFor,
  readConsent,
  syncConsentFromServer,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";

function consentResponse(categories: ConsentState, updatedAt = "2026-09-29T08:00:00.000Z") {
  return new Response(JSON.stringify({ record: { version: 1, categories, updatedAt } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function noServerRecordResponse() {
  return new Response(JSON.stringify({ record: null }), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("consent storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(global.fetch).mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns null when nothing has been saved", () => {
    expect(readConsent()).toBeNull();
  });

  it("round-trips a server-confirmed consent record", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(consentResponse(ALL_ACCEPTED_CONSENT));
    const written = await writeConsent(ALL_ACCEPTED_CONSENT);
    expect(written.pendingSync).toBeUndefined();
    expect(readConsent()).toEqual(written);
    expect(hasConsentFor("analytics")).toBe(true);
  });

  it("always forces necessary to true even if a caller tries to disable it", async () => {
    const expected = { ...DEFAULT_CONSENT, necessary: true };
    vi.mocked(global.fetch).mockResolvedValueOnce(consentResponse(expected));
    await writeConsent({ ...DEFAULT_CONSENT, necessary: false as unknown as true });
    expect(readConsent()?.categories.necessary).toBe(true);
  });

  it("ignores malformed local records and records from a stale consent version", () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: 0, categories: ALL_ACCEPTED_CONSENT, updatedAt: new Date().toISOString() }),
    );
    expect(readConsent()).toBeNull();
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: 1, categories: ALL_ACCEPTED_CONSENT, updatedAt: new Date().toISOString(), secret: "do-not-store" }),
    );
    expect(readConsent()).toBeNull();
  });

  it("posts the selected categories to the durable store", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(consentResponse(ALL_ACCEPTED_CONSENT));
    await writeConsent(ALL_ACCEPTED_CONSENT);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/consent",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ categories: { ...ALL_ACCEPTED_CONSENT, necessary: true } }),
      }),
    );
  });

  it("does not treat an HTTP 503 as successful persistence", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ error: "Temporarily unavailable." }), { status: 503 }));
    const record = await writeConsent(ALL_ACCEPTED_CONSENT);
    expect(record.pendingSync).toBe(true);
    expect(readConsent()?.pendingSync).toBe(true);
  });

  it("keeps the local choice and marks it pending after a network failure", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("network down"));
    await writeConsent(ALL_ACCEPTED_CONSENT);
    expect(readConsent()).toMatchObject({ categories: ALL_ACCEPTED_CONSENT, pendingSync: true });
  });

  it("retries a pending write on a later sync and clears pending only after success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 503 }));
    await writeConsent(ALL_ACCEPTED_CONSENT);

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(noServerRecordResponse())
      .mockResolvedValueOnce(consentResponse(ALL_ACCEPTED_CONSENT, "2026-09-29T09:00:00.000Z"));
    await syncConsentFromServer();

    expect(readConsent()).toEqual({
      version: 1,
      categories: ALL_ACCEPTED_CONSENT,
      updatedAt: "2026-09-29T09:00:00.000Z",
    });
  });

  it("deduplicates concurrent mount synchronization and bounds it to one GET plus one retry", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("offline"));
    await writeConsent(ALL_ACCEPTED_CONSENT);
    vi.mocked(global.fetch).mockClear();

    let resolveGet!: (response: Response) => void;
    vi.mocked(global.fetch)
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveGet = resolve; }))
      .mockResolvedValueOnce(consentResponse(ALL_ACCEPTED_CONSENT));
    const first = syncConsentFromServer();
    const second = syncConsentFromServer();
    resolveGet(noServerRecordResponse());
    await Promise.all([first, second]);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(readConsent()?.pendingSync).toBeUndefined();
  });

  it("does not replace a newer local preference with older server data", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 503 }));
    await writeConsent(ALL_ACCEPTED_CONSENT);
    const localTimestamp = readConsent()!.updatedAt;
    const olderTimestamp = new Date(Date.parse(localTimestamp) - 60_000).toISOString();
    vi.mocked(global.fetch).mockClear();

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(consentResponse(DEFAULT_CONSENT, olderTimestamp))
      .mockResolvedValueOnce(consentResponse(ALL_ACCEPTED_CONSENT, "2026-09-29T10:00:00.000Z"));
    await syncConsentFromServer();

    expect(readConsent()?.categories).toEqual(ALL_ACCEPTED_CONSENT);
    expect(vi.mocked(global.fetch).mock.calls[1]?.[1]).toMatchObject({ method: "POST" });
  });

  it("adopts a newer server preference over an older local record without an unnecessary write", async () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ version: 1, categories: DEFAULT_CONSENT, updatedAt: "2026-09-29T07:00:00.000Z" }),
    );
    vi.mocked(global.fetch).mockResolvedValueOnce(consentResponse(ALL_ACCEPTED_CONSENT, "2026-09-29T08:00:00.000Z"));
    await syncConsentFromServer();
    expect(readConsent()?.categories).toEqual(ALL_ACCEPTED_CONSENT);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("adopts a server record when the local cache is empty", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(consentResponse(ALL_ACCEPTED_CONSENT));
    await syncConsentFromServer();
    expect(readConsent()?.categories).toEqual(ALL_ACCEPTED_CONSENT);
  });

  it("stores only consent categories, timestamp, version, and a non-sensitive pending flag", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("offline"));
    await writeConsent(ALL_ACCEPTED_CONSENT);
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)!;
    const stored = JSON.parse(raw) as Record<string, unknown>;
    expect(Object.keys(stored).sort()).toEqual(["categories", "pendingSync", "updatedAt", "version"]);
    expect(raw).not.toMatch(/visitor|ipAddress|token|secret|key/i);
  });
});
