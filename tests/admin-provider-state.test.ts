import { describe, expect, it } from "vitest";
import { calendlyStatePresentation, formatAdminDate, providerStatePresentation } from "@/lib/adminPresentation";
import { providerStateFromResult } from "@/lib/providerState";

describe("admin provider-state presentation", () => {
  it("maps real provider outcomes without inventing success", () => {
    expect(providerStateFromResult(true)).toBe("SUCCEEDED");
    expect(providerStateFromResult(false, "not_configured")).toBe("DISABLED");
    for (const reason of ["misconfigured", "timeout", "provider_error"] as const) {
      expect(providerStateFromResult(false, reason)).toBe("FAILED");
    }
    expect(providerStatePresentation("NOT_ATTEMPTED").label).toBe("Not attempted");
    expect(providerStatePresentation("LEGACY_UNKNOWN").label).toBe("Legacy / unknown");
  });

  it("derives Calendly status only from persisted evidence", () => {
    expect(calendlyStatePresentation({ status: "PENDING", hasCorrelation: true, confirmedAt: null }).label).toBe("Pending");
    expect(calendlyStatePresentation({ status: "PENDING", hasCorrelation: false, confirmedAt: null }).label).toBe("Legacy / unknown");
    expect(calendlyStatePresentation({ status: "CONFIRMED", hasCorrelation: true, confirmedAt: new Date() }).label).toBe("Confirmed");
    expect(calendlyStatePresentation({ status: "CANCELLED", hasCorrelation: true, confirmedAt: null }).label).toBe("Cancelled");
  });

  it("labels administration timestamps explicitly in UTC", () => {
    expect(formatAdminDate(new Date("2026-09-25T12:34:00.000Z"))).toMatch(/25 Sept 2026.*12:34.*UTC/);
    expect(formatAdminDate(null)).toBe("Not recorded");
  });
});
