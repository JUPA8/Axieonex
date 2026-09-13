import { afterEach, describe, expect, it, vi } from "vitest";
import { getAvailabilityAction } from "@/app/book-strategy-call/actions";

describe("getAvailabilityAction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to the mocked next-4-weekdays generator when Cal.com isn't configured", async () => {
    vi.stubEnv("CALENDAR_PROVIDER_API_KEY", "");
    vi.stubEnv("CALENDAR_ID", "");

    const result = await getAvailabilityAction();
    expect(result.source).toBe("mock");
    expect(result.days).toHaveLength(4);
    expect(result.days[0].slots).toHaveLength(4);
  });
});
