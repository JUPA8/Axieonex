import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getContact: vi.fn(), notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }) }));
vi.mock("@/lib/adminData", () => ({ getAdminContact: mocks.getContact }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import AdminContactDetailPage from "@/app/admin/(dashboard)/contacts/[id]/page";

const contact = {
  purpose: "service",
  name: "Hostile <script>window.__contactXss = true</script>",
  email: "long-contact-address@example.test",
  company: "Example <img src=x onerror=alert(1)>",
  message: "First line\n</p><script>window.__contactXss = true</script>\nLast line",
  createdAt: new Date("2026-09-25T10:00:00.000Z"),
  updatedAt: new Date("2026-09-25T10:05:00.000Z"),
  emailSentAt: null,
  emailState: "FAILED" as const,
  emailStateUpdatedAt: new Date("2026-09-25T10:01:00.000Z"),
  crmSyncedAt: null,
  crmState: "DISABLED" as const,
  crmStateUpdatedAt: new Date("2026-09-25T10:02:00.000Z"),
  ipAddress: "sensitive-ip-sentinel",
};

describe("admin contact detail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders operational fields, truthful states, safe hostile text, and a preserved back route", async () => {
    mocks.getContact.mockResolvedValue(contact);
    render(await AdminContactDetailPage({
      params: Promise.resolve({ id: "c123456789012345678901234" }),
      searchParams: Promise.resolve({ contactsPage: "2", bookingsPage: "3" }),
    }));

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Contact submission" })).toBeInTheDocument();
    expect(screen.getByText(/First line/)).toHaveTextContent("window.__contactXss = true");
    expect(document.querySelector("script")).toBeNull();
    expect((window as typeof window & { __contactXss?: boolean }).__contactXss).toBeUndefined();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Disabled / not configured")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to submissions" })).toHaveAttribute("href", "/admin?contactsPage=2&bookingsPage=3");
    expect(document.body).not.toHaveTextContent("sensitive-ip-sentinel");
  });

  it("uses the route not-found boundary for a missing record", async () => {
    mocks.getContact.mockResolvedValue(null);
    await expect(AdminContactDetailPage({
      params: Promise.resolve({ id: "c123456789012345678901234" }),
      searchParams: Promise.resolve({}),
    })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalledOnce();
  });
});
