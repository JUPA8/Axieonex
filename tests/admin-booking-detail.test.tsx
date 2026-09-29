import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getBooking: vi.fn(), notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));
vi.mock("@/lib/adminData", () => ({ getAdminBooking: mocks.getBooking }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import AdminBookingDetailPage from "@/app/admin/(dashboard)/bookings/[id]/page";

const booking = {
  name: "Booking <script>window.__bookingXss = true</script>",
  email: "very-long-booking-address@example.test",
  phone: "+49 30 555 0100",
  role: "Founder",
  company: "Example <img src=x onerror=alert(1)>",
  website: "javascript:alert(1)",
  country: "Germany",
  size: "11-50",
  approach: "First line\n<script>window.__bookingXss = true</script>",
  outcome: "Verified operations",
  market: "Europe",
  budget: "3k-8k",
  slotId: "2026-10-01T09:00:00.000Z",
  slotLabel: "1 October 2026 at 09:00 UTC",
  status: "PENDING" as const,
  calendarBookingUid: null,
  confirmedAt: null,
  createdAt: new Date("2026-09-25T10:00:00.000Z"),
  updatedAt: new Date("2026-09-25T10:05:00.000Z"),
  emailSentAt: null,
  emailState: "NOT_ATTEMPTED" as const,
  emailStateUpdatedAt: null,
  crmSyncedAt: null,
  crmState: "NOT_ATTEMPTED" as const,
  crmStateUpdatedAt: null,
  hasCalendarCorrelation: true,
  hasCalendarInvitee: false,
  calendarCorrelationId: "sensitive-correlation-sentinel",
  calendarInviteeUid: "sensitive-invitee-sentinel",
};

describe("admin booking detail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders a pending booking without executing hostile stored strings or exposing identifiers", async () => {
    mocks.getBooking.mockResolvedValue(booking);
    render(await AdminBookingDetailPage({
      params: Promise.resolve({ id: "c123456789012345678901234" }),
      searchParams: Promise.resolve({ contactsPage: "2", bookingsPage: "3" }),
    }));

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("Awaiting a verified Calendly confirmation webhook.")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect((window as typeof window & { __bookingXss?: boolean }).__bookingXss).toBeUndefined();
    expect(document.body).not.toHaveTextContent("sensitive-correlation-sentinel");
    expect(document.body).not.toHaveTextContent("sensitive-invitee-sentinel");
    expect(screen.getByRole("link", { name: "Back to submissions" })).toHaveAttribute("href", "/admin?contactsPage=2&bookingsPage=3");
  });

  it("renders only persisted evidence as a confirmed provider outcome", async () => {
    mocks.getBooking.mockResolvedValue({
      ...booking,
      status: "CONFIRMED",
      calendarBookingUid: "https://api.calendly.com/scheduled_events/disposable",
      confirmedAt: new Date("2026-09-25T10:10:00.000Z"),
      emailState: "SUCCEEDED",
      emailSentAt: new Date("2026-09-25T10:11:00.000Z"),
      emailStateUpdatedAt: new Date("2026-09-25T10:11:00.000Z"),
      crmState: "FAILED",
      crmStateUpdatedAt: new Date("2026-09-25T10:12:00.000Z"),
      hasCalendarInvitee: true,
    });
    render(await AdminBookingDetailPage({
      params: Promise.resolve({ id: "c123456789012345678901234" }),
      searchParams: Promise.resolve({}),
    }));
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    expect(screen.getByText("A verified Calendly webhook confirmed this booking.")).toBeInTheDocument();
    expect(screen.getByText("Succeeded")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("uses the route not-found boundary for a missing record", async () => {
    mocks.getBooking.mockResolvedValue(null);
    await expect(AdminBookingDetailPage({
      params: Promise.resolve({ id: "c123456789012345678901234" }),
      searchParams: Promise.resolve({}),
    })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalledOnce();
  });
});
