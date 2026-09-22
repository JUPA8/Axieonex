import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn(), email: vi.fn(), crm: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { bookingRequest: {
  findUnique: mocks.findUnique, updateMany: mocks.updateMany, update: mocks.update, create: vi.fn(),
} } }));
vi.mock("@/lib/email", () => ({ sendNotificationEmail: mocks.email }));
vi.mock("@/lib/crm", () => ({ pushToCrm: mocks.crm }));

import { confirmPendingBooking } from "@/lib/bookingProvider";

const booking = { id: "booking-1", status: "PENDING", calendarInviteeUid: null, email: "jane@example.com", company: "Acme", name: "Jane", role: "CEO", phone: "1", website: "acme.test", size: "10", country: "US", market: "US", approach: "Email", outcome: "Growth", budget: "3k" };
const input = { correlationId: "axieonex_123e4567-e89b-42d3-a456-426614174000", eventUri: "https://api.calendly.com/scheduled_events/e", inviteeUri: "https://api.calendly.com/scheduled_events/e/invitees/i", inviteeEmail: "JANE@example.com" };

describe("confirmed booking idempotency", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.email.mockResolvedValue({ sent: true }); mocks.crm.mockResolvedValue({ ok: true }); mocks.update.mockResolvedValue({}); });

  it("lets only the atomic PENDING transition send side effects", async () => {
    mocks.findUnique.mockResolvedValue(booking);
    mocks.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    mocks.findUnique.mockResolvedValueOnce(booking).mockResolvedValueOnce(booking).mockResolvedValueOnce({ ...booking, status: "CONFIRMED", calendarInviteeUid: input.inviteeUri });
    const results = await Promise.all([confirmPendingBooking(input), confirmPendingBooking(input)]);
    expect(results.sort()).toEqual(["confirmed", "duplicate"]);
    expect(mocks.email).toHaveBeenCalledTimes(1);
    expect(mocks.crm).toHaveBeenCalledTimes(1);
  });

  it("rejects an email mismatch before the transition", async () => {
    mocks.findUnique.mockResolvedValue(booking);
    await expect(confirmPendingBooking({ ...input, inviteeEmail: "attacker@example.com" })).resolves.toBe("conflict");
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("keeps the confirmed transition when optional providers fail", async () => {
    mocks.findUnique.mockResolvedValue(booking);
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.email.mockResolvedValue({ sent: false, reason: "timeout" });
    mocks.crm.mockResolvedValue({ ok: false, reason: "provider_error" });
    await expect(confirmPendingBooking(input)).resolves.toBe("confirmed");
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
