import { describe, expect, it } from "vitest";
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5 } from "@/lib/bookingValidation";
import { EMPTY_BOOKING_DATA } from "@/types/booking";

describe("validateStep1", () => {
  it("flags every required field when empty", () => {
    const errors = validateStep1(EMPTY_BOOKING_DATA);
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.role).toBeTruthy();
  });

  it("rejects an invalid email", () => {
    const errors = validateStep1({ ...EMPTY_BOOKING_DATA, name: "Jane", email: "not-an-email", phone: "+1 555 0100", role: "CEO" });
    expect(errors.email).toBeTruthy();
  });

  it("passes with valid data", () => {
    const errors = validateStep1({ ...EMPTY_BOOKING_DATA, name: "Jane Doe", email: "jane@example.com", phone: "+1 555 0100", role: "CEO" });
    expect(errors).toEqual({});
  });
});

describe("validateStep2", () => {
  it("rejects an invalid website", () => {
    const errors = validateStep2({ ...EMPTY_BOOKING_DATA, company: "Acme", website: "not a url", country: "US", size: "1-10" });
    expect(errors.website).toBeTruthy();
  });

  it("passes with a bare domain", () => {
    const errors = validateStep2({ ...EMPTY_BOOKING_DATA, company: "Acme", website: "acme.com", country: "US", size: "1-10" });
    expect(errors).toEqual({});
  });
});

describe("validateStep3", () => {
  it("requires a budget selection", () => {
    const errors = validateStep3({ ...EMPTY_BOOKING_DATA, approach: "x", outcome: "y", market: "EU", budget: "" });
    expect(errors.budget).toBeTruthy();
  });
});

describe("validateStep4", () => {
  it("requires a selected slot", () => {
    expect(validateStep4(null).slot).toBeTruthy();
    expect(validateStep4("2026-01-01_9:00 AM")).toEqual({});
  });
});

describe("validateStep5", () => {
  it("requires consent", () => {
    expect(validateStep5({ ...EMPTY_BOOKING_DATA, consent: false }).consent).toBeTruthy();
    expect(validateStep5({ ...EMPTY_BOOKING_DATA, consent: true })).toEqual({});
  });
});
