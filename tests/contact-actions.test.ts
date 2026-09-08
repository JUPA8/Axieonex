import { afterEach, describe, expect, it, vi } from "vitest";
import { submitContactAction, type ContactFormState } from "@/app/contact/actions";

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

  it("honestly reports 'unavailable' rather than a fake success when no delivery endpoint is configured", async () => {
    vi.stubEnv("CONTACT_FORM_ENDPOINT", "");
    const result = await submitContactAction(
      INITIAL_STATE,
      formDataFrom({ purpose: "general", name: "Jane Doe", email: "jane@example.com", message: "Hello", consent: "on" }),
    );
    expect(result.status).toBe("unavailable");
    expect(result.errors).toEqual({});
  });
});
