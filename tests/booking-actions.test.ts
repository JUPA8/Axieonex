import { afterEach, describe, expect, it, vi } from "vitest";
import { submitBookingAction } from "@/app/book-strategy-call/actions";
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

describe("submitBookingAction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports invalid when required fields are missing", async () => {
    const result = await submitBookingAction(EMPTY_BOOKING_DATA, "", "", "", null);
    expect(result).toEqual({ status: "invalid" });
  });

  it("reports invalid when no slot was selected, even with otherwise valid data", async () => {
    const result = await submitBookingAction(VALID_DATA, "", "", "", null);
    expect(result).toEqual({ status: "invalid" });
  });

  it("silently reports success for a honeypot-tripped submission without validating or persisting", async () => {
    const result = await submitBookingAction(EMPTY_BOOKING_DATA, "", "", "http://spam.example", null);
    expect(result).toEqual({ status: "success" });
  });

  it("honestly reports 'unavailable' rather than a fake success when the database isn't configured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const result = await submitBookingAction(VALID_DATA, "slot-1", "Monday, Jan 1 at 9:00 AM", "", null);
    expect(result).toEqual({ status: "unavailable" });
  });
});
