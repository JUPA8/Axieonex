import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ confirm: vi.fn() }));
vi.mock("@/lib/bookingProvider", () => ({ confirmPendingBooking: mocks.confirm }));

import { POST } from "@/app/api/webhooks/calendly/route";

const body = JSON.stringify({
  event: "invitee.created",
  created_by: "https://api.calendly.com/users/user-1",
  payload: {
    event: "https://api.calendly.com/scheduled_events/event-1",
    uri: "https://api.calendly.com/scheduled_events/event-1/invitees/invitee-1",
    email: "jane@example.com",
    tracking: { utm_content: "axieonex_123e4567-e89b-42d3-a456-426614174000" },
  },
});

describe("Calendly webhook route", () => {
  beforeEach(() => {
    vi.stubEnv("CALENDLY_WEBHOOK_SIGNING_KEY", "key");
    vi.stubEnv("CALENDLY_WEBHOOK_USER_URI", "https://api.calendly.com/users/user-1");
    mocks.confirm.mockResolvedValue("confirmed");
  });
  afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

  it("rejects an unsigned request before confirmation", async () => {
    const response = await POST(new Request("https://example.com/api/webhooks/calendly", { method: "POST", body }));
    expect(response.status).toBe(401);
    expect(mocks.confirm).not.toHaveBeenCalled();
  });

  it("confirms only a valid signed payload", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const digest = createHmac("sha256", "key").update(`${timestamp}.${body}`).digest("hex");
    const response = await POST(new Request("https://example.com/api/webhooks/calendly", { method: "POST", body, headers: { "Calendly-Webhook-Signature": `t=${timestamp},v1=${digest}` } }));
    expect(response.status).toBe(200);
    expect(mocks.confirm).toHaveBeenCalledWith(expect.objectContaining({ inviteeEmail: "jane@example.com" }));
  });
});
