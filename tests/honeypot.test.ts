import { describe, expect, it } from "vitest";
import { HONEYPOT_FIELD_NAME, isHoneypotTripped, isHoneypotValueTripped } from "@/lib/security/honeypot";

describe("isHoneypotValueTripped", () => {
  it("is false for empty, whitespace-only, or missing values", () => {
    expect(isHoneypotValueTripped("")).toBe(false);
    expect(isHoneypotValueTripped("   ")).toBe(false);
    expect(isHoneypotValueTripped(undefined)).toBe(false);
    expect(isHoneypotValueTripped(null)).toBe(false);
  });

  it("is true for any non-empty string a bot filled in", () => {
    expect(isHoneypotValueTripped("http://spam.example")).toBe(true);
  });
});

describe("isHoneypotTripped (FormData)", () => {
  it("reads the honeypot field off FormData", () => {
    const empty = new FormData();
    expect(isHoneypotTripped(empty)).toBe(false);

    const filled = new FormData();
    filled.set(HONEYPOT_FIELD_NAME, "i am a bot");
    expect(isHoneypotTripped(filled)).toBe(true);
  });
});
