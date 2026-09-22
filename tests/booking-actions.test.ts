import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_BOOKING_DATA, type BookingData } from "@/types/booking";

const mocks = vi.hoisted(() => ({ create: vi.fn(), status: vi.fn(), ip: vi.fn(), limit: vi.fn(), turnstile: vi.fn() }));
vi.mock("@/lib/bookingProvider", () => ({ createPendingBooking: mocks.create, getBookingStatus: mocks.status }));
vi.mock("@/lib/security/getClientIp", () => ({ getClientIp: mocks.ip }));
vi.mock("@/lib/security/rateLimit", () => ({ checkRateLimit: mocks.limit, warnIfRateLimitUnconfigured: vi.fn() }));
vi.mock("@/lib/security/turnstile", () => ({ verifyTurnstile: mocks.turnstile }));

import { getBookingStatusAction, verifyBookingGateAction } from "@/app/book-strategy-call/actions";

const VALID_DATA: BookingData = { name: "Jane Doe", email: "jane@example.com", phone: "+1 555 0100", role: "CEO", company: "Acme", website: "acme.com", country: "US", size: "1-10", approach: "Cold email only", outcome: "Predictable pipeline", market: "North America", budget: "3k-8k", consent: true };

describe("booking actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_CALENDLY_URL", "https://calendly.com/example/call");
    vi.stubEnv("CALENDLY_WEBHOOK_SIGNING_KEY", "key");
    vi.stubEnv("CALENDLY_WEBHOOK_USER_URI", "https://api.calendly.com/users/user-1");
    mocks.ip.mockResolvedValue("127.0.0.1");
    mocks.limit.mockResolvedValue({ limited: false });
    mocks.turnstile.mockResolvedValue({ status: "skipped" });
    mocks.create.mockResolvedValue({ ok: true, correlationId: "axieonex_123e4567-e89b-42d3-a456-426614174000" });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("rejects invalid input and honeypot spam", async () => {
    expect(await verifyBookingGateAction(EMPTY_BOOKING_DATA, "", null)).toEqual({ status: "invalid" });
    expect(await verifyBookingGateAction(EMPTY_BOOKING_DATA, "spam", null)).toEqual({ status: "spam" });
  });

  it("never reveals the scheduler unless webhook verification is configured", async () => {
    vi.stubEnv("CALENDLY_WEBHOOK_SIGNING_KEY", "");
    expect(await verifyBookingGateAction(VALID_DATA, "", null)).toEqual({ status: "unavailable" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("persists a pending request and returns only its opaque correlation id", async () => {
    expect(await verifyBookingGateAction(VALID_DATA, "", null)).toEqual({ status: "ok", correlationId: "axieonex_123e4567-e89b-42d3-a456-426614174000" });
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ email: "jane@example.com", ipAddress: "127.0.0.1" }));
  });

  it("exposes status as read-only and cannot confirm from the client", async () => {
    mocks.status.mockResolvedValue("confirmed");
    await expect(getBookingStatusAction("axieonex_123e4567-e89b-42d3-a456-426614174000")).resolves.toEqual({ status: "confirmed" });
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
