import { afterEach, describe, expect, it, vi } from "vitest";
import { submitBookingAction, verifyBookingGateAction } from "@/app/book-strategy-call/actions";
import { EMPTY_BOOKING_DATA, type BookingData } from "@/types/booking";

const VALID_DATA: BookingData = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 555 0100",
  role: "CEO",
  company: "Acme",
  website: "acme.com",
  country: "US",
  size: "1-10",
  approach: "Cold email only",
  outcome: "Predictable pipeline",
  market: "North America",
  budget: "3k-8k",
  consent: true,
};

describe("verifyBookingGateAction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports invalid when required fields or consent are missing", async () => {
    const result = await verifyBookingGateAction(EMPTY_BOOKING_DATA, "", null);
    expect(result).toEqual({ status: "invalid" });
  });

  it("reports spam for a honeypot-tripped submission without validating anything else", async () => {
    const result = await verifyBookingGateAction(EMPTY_BOOKING_DATA, "http://spam.example", null);
    expect(result).toEqual({ status: "spam" });
  });

  it("passes valid, consented data through to reveal the real scheduler", async () => {
    const result = await verifyBookingGateAction(VALID_DATA, "", null);
    expect(result.status).toBe("ok");
  });
});

describe("submitBookingAction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports invalid when the Calendly-confirmed slot info is missing", async () => {
    const result = await submitBookingAction(VALID_DATA, "", "", "");
    expect(result).toEqual({ status: "invalid" });
  });

  it("honestly reports 'unavailable' rather than a fake success when the database isn't configured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const result = await submitBookingAction(
      VALID_DATA,
      "2026-01-01T09:00:00.000Z",
      "Monday, Jan 1 at 9:00 AM",
      "https://api.calendly.com/scheduled_events/abc123",
    );
    expect(result).toEqual({ status: "unavailable" });
  });
});
