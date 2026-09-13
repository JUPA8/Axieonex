import { afterEach, describe, expect, it, vi } from "vitest";
import { submitContactAction, type ContactFormState } from "@/app/contact/actions";
import { HONEYPOT_FIELD_NAME } from "@/lib/security/honeypot";

const INITIAL_STATE: ContactFormState = { status: "idle", errors: {} };

function formDataFrom(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("submitContactAction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports field errors for an empty submission without calling the delivery provider", async () => {
    const result = await submitContactAction(INITIAL_STATE, formDataFrom({}));
    expect(result.status).toBe("idle");
    expect(result.errors.purpose).toBeTruthy();
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.message).toBeTruthy();
    expect(result.errors.consent).toBeTruthy();
  });

  it("rejects an invalid email even when every other field is valid", async () => {
    const result = await submitContactAction(
      INITIAL_STATE,
      formDataFrom({ purpose: "general", name: "Jane Doe", email: "not-an-email", message: "Hello", consent: "on" }),
    );
    expect(result.status).toBe("idle");
    expect(result.errors.email).toBeTruthy();
  });

  it("honestly reports 'unavailable' rather than a fake success when the database isn't configured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const result = await submitContactAction(
      INITIAL_STATE,
      formDataFrom({ purpose: "general", name: "Jane Doe", email: "jane@example.com", message: "Hello", consent: "on" }),
    );
    expect(result.status).toBe("unavailable");
    expect(result.errors).toEqual({});
  });

  it("silently reports success for a honeypot-tripped submission without validating or persisting", async () => {
    const data = formDataFrom({});
    data.set(HONEYPOT_FIELD_NAME, "http://spam.example");
    const result = await submitContactAction(INITIAL_STATE, data);
    expect(result).toEqual({ status: "success", errors: {} });
  });
});
