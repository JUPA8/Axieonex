import { describe, expect, it } from "vitest";
import {
  EMPTY_DEMO_FORM,
  isDemoFormValid,
  validateDemoForm,
  type DemoFormValues,
} from "@/features/contact/validation";

const VALID_FORM: DemoFormValues = {
  fullName: "Jane Doe",
  companyName: "Acme Inc.",
  role: "CEO",
  companyWebsite: "www.acme.com",
  businessEmail: "jane@acme.com",
  phoneNumber: "+1 (555) 123-4567",
  companySize: "10–50",
  country: "United States",
  monthlyBudget: "$5k–$9k",
  notes: "",
};

describe("demo form validation", () => {
  it("rejects a completely empty form with an error per required field", () => {
    const errors = validateDemoForm(EMPTY_DEMO_FORM);
    expect(errors.fullName).toBeDefined();
    expect(errors.companyName).toBeDefined();
    expect(errors.role).toBeDefined();
    expect(errors.companyWebsite).toBeDefined();
    expect(errors.businessEmail).toBeDefined();
    expect(errors.phoneNumber).toBeDefined();
    expect(errors.companySize).toBeDefined();
    expect(errors.country).toBeDefined();
    expect(errors.monthlyBudget).toBeDefined();
    // notes is optional
    expect(errors.notes).toBeUndefined();
  });

  it("accepts a fully valid form", () => {
    expect(validateDemoForm(VALID_FORM)).toEqual({});
    expect(isDemoFormValid(VALID_FORM)).toBe(true);
  });

  it("rejects an invalid business email", () => {
    const errors = validateDemoForm({ ...VALID_FORM, businessEmail: "not-an-email" });
    expect(errors.businessEmail).toBeDefined();
  });

  it("rejects an invalid company website", () => {
    const errors = validateDemoForm({ ...VALID_FORM, companyWebsite: "not a url" });
    expect(errors.companyWebsite).toBeDefined();
  });

  it("accepts a website with or without a protocol", () => {
    expect(validateDemoForm({ ...VALID_FORM, companyWebsite: "acme.com" }).companyWebsite).toBeUndefined();
    expect(
      validateDemoForm({ ...VALID_FORM, companyWebsite: "https://acme.com" }).companyWebsite
    ).toBeUndefined();
  });

  it("rejects an implausible phone number", () => {
    const errors = validateDemoForm({ ...VALID_FORM, phoneNumber: "abc" });
    expect(errors.phoneNumber).toBeDefined();
  });

  it("rejects notes over the 150-character limit", () => {
    const errors = validateDemoForm({ ...VALID_FORM, notes: "x".repeat(151) });
    expect(errors.notes).toBeDefined();
  });

  it("accepts notes exactly at the 150-character limit", () => {
    const errors = validateDemoForm({ ...VALID_FORM, notes: "x".repeat(150) });
    expect(errors.notes).toBeUndefined();
  });
});
