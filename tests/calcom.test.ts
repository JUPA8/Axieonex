import { afterEach, describe, expect, it, vi } from "vitest";
import { createCalcomBooking, getCalcomAvailability } from "@/lib/calendar/calcom";

describe("Cal.com integration (unconfigured)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("getCalcomAvailability returns null without making a network call", async () => {
    vi.stubEnv("CALENDAR_PROVIDER_API_KEY", "");
    vi.stubEnv("CALENDAR_ID", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await getCalcomAvailability();
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("createCalcomBooking reports not_configured without making a network call", async () => {
    vi.stubEnv("CALENDAR_PROVIDER_API_KEY", "");
    vi.stubEnv("CALENDAR_ID", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await createCalcomBooking({ slotStartIso: "2026-01-01T09:00:00Z", name: "Jane", email: "jane@example.com", notes: "" });
    expect(result).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("Cal.com integration (configured)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("parses a successful slots response into AvailabilityDay[]", async () => {
    vi.stubEnv("CALENDAR_PROVIDER_API_KEY", "test-key");
    vi.stubEnv("CALENDAR_ID", "123");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "success",
          data: {
            "2026-01-05": [{ start: "2026-01-05T09:00:00Z" }, { start: "2026-01-05T11:00:00Z" }],
          },
        }),
      }),
    );

    const result = await getCalcomAvailability();
    expect(result).not.toBeNull();
    expect(result?.[0].slots).toHaveLength(2);
    expect(result?.[0].slots[0].id).toBe("2026-01-05T09:00:00Z");
  });

  it("returns null (not an empty array) on a non-OK response, so the caller falls back to mock", async () => {
    vi.stubEnv("CALENDAR_PROVIDER_API_KEY", "test-key");
    vi.stubEnv("CALENDAR_ID", "123");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    const result = await getCalcomAvailability();
    expect(result).toBeNull();
  });

  it("returns a bookingUid on a successful booking response", async () => {
    vi.stubEnv("CALENDAR_PROVIDER_API_KEY", "test-key");
    vi.stubEnv("CALENDAR_ID", "123");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { uid: "abc123" } }),
      }),
    );

    const result = await createCalcomBooking({ slotStartIso: "2026-01-05T09:00:00Z", name: "Jane", email: "jane@example.com", notes: "" });
    expect(result).toEqual({ ok: true, bookingUid: "abc123" });
  });
});
