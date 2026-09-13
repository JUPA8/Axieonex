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
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchSpy);

    const result = await pushToCrm(BASE_CONTACT);
    expect(result).toEqual({ ok: true });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.hubapi.com/crm/v3/objects/contacts");
    const body = JSON.parse(init.body);
    expect(body.properties.firstname).toBe("Jane");
    expect(body.properties.lastname).toBe("Doe");
    expect(body.properties.email).toBe("jane@example.com");
  });

  it("treats a 409 (contact already exists) as success, not a failure", async () => {
    vi.stubEnv("CRM_API_KEY", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409 }));

    const result = await pushToCrm(BASE_CONTACT);
    expect(result).toEqual({ ok: true });
  });

  it("reports send_failed on any other error status", async () => {
    vi.stubEnv("CRM_API_KEY", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "server error" }));

    const result = await pushToCrm(BASE_CONTACT);
    expect(result).toEqual({ ok: false, reason: "send_failed" });
  });
});
