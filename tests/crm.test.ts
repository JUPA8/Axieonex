import { afterEach, describe, expect, it, vi } from "vitest";
import { pushToCrm } from "@/lib/crm";

const BASE_CONTACT = { name: "Jane Doe", email: "jane@example.com", message: "Hello", source: "contact_form" as const };

describe("pushToCrm", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports not_configured without making a network call when CRM_API_KEY is unset", async () => {
    vi.stubEnv("CRM_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await pushToCrm(BASE_CONTACT);
    expect(result).toEqual({ ok: false, reason: "not_configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("pushes a contact to HubSpot with the name split into first/last", async () => {
    vi.stubEnv("CRM_API_KEY", "test-token");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [{ id: "contact-1" }] }) });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await pushToCrm(BASE_CONTACT);
    expect(result).toEqual({ ok: true });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert");
    const body = JSON.parse(init.body);
    expect(body.inputs[0].id).toBe("jane@example.com");
    expect(body.inputs[0].idProperty).toBe("email");
    expect(body.inputs[0].properties.firstname).toBe("Jane");
    expect(body.inputs[0].properties.lastname).toBe("Doe");
  });

  it("uses an email-keyed idempotent upsert and preserves the latest enquiry", async () => {
    vi.stubEnv("CRM_API_KEY", "test-token");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [{ id: "contact-1" }] }) });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await pushToCrm(BASE_CONTACT);
    expect(result).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).inputs[0].properties.axieonex_message).toBe("Hello");
  });

  it("does not report synchronized for a 409 or malformed success response", async () => {
    vi.stubEnv("CRM_API_KEY", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 409 }).mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }));
    await expect(pushToCrm(BASE_CONTACT)).resolves.toEqual({ ok: false, reason: "provider_error" });
    await expect(pushToCrm(BASE_CONTACT)).resolves.toEqual({ ok: false, reason: "provider_error" });
  });

  it("reports send_failed on any other error status", async () => {
    vi.stubEnv("CRM_API_KEY", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "server error" }));

    const result = await pushToCrm(BASE_CONTACT);
    expect(result).toEqual({ ok: false, reason: "provider_error" });
  });

  it("returns a defined retryable error for a rejected request", async () => {
    vi.stubEnv("CRM_API_KEY", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(pushToCrm(BASE_CONTACT)).resolves.toEqual({ ok: false, reason: "provider_error" });
  });
});
