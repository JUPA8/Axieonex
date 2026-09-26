import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  ADMIN_PAGE_SIZE,
  adminDashboardHref,
  adminDetailHref,
  createAdminPagination,
  parseAdminPage,
} from "@/lib/adminPagination";

describe("admin pagination", () => {
  it("normalizes invalid, negative, repeated, and excessive page parameters", () => {
    for (const value of [undefined, "", "0", "-1", "1.5", "text", "10001", ["2", "3"]]) {
      expect(parseAdminPage(value)).toBe(1);
    }
    expect(parseAdminPage("2")).toBe(2);
    expect(parseAdminPage("10000")).toBe(10_000);
  });

  it("calculates first, middle, last partial, empty, and out-of-range pages", () => {
    expect(createAdminPagination(0, 1)).toMatchObject({ page: 1, totalPages: 1, totalItems: 0, hasPreviousPage: false, hasNextPage: false });
    expect(createAdminPagination(45, 1)).toMatchObject({ page: 1, totalPages: 3, hasPreviousPage: false, hasNextPage: true });
    expect(createAdminPagination(45, 2)).toMatchObject({ page: 2, totalPages: 3, hasPreviousPage: true, hasNextPage: true });
    expect(createAdminPagination(45, 3)).toMatchObject({ page: 3, totalPages: 3, hasPreviousPage: true, hasNextPage: false });
    expect(createAdminPagination(45, 999)).toMatchObject({ page: 3, totalPages: 3 });
    expect(createAdminPagination(ADMIN_PAGE_SIZE, 2)).toMatchObject({ page: 1, totalPages: 1 });
  });

  it("preserves both list positions in dashboard and detail links", () => {
    expect(adminDashboardHref(2, 3)).toBe("/admin?contactsPage=2&bookingsPage=3");
    expect(adminDetailHref("contacts", "record-id", 2, 3)).toBe("/admin/contacts/record-id?contactsPage=2&bookingsPage=3");
  });

  it("renders accessible previous and next navigation without fake enabled controls", () => {
    const { rerender } = render(
      <AdminPagination
        label="Contact submissions"
        kind="contacts"
        pagination={createAdminPagination(45, 1)}
        contactPage={1}
        bookingPage={2}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Contact submissions pagination" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/admin?contactsPage=2&bookingsPage=2");

    rerender(
      <AdminPagination
        label="Contact submissions"
        kind="contacts"
        pagination={createAdminPagination(45, 3)}
        contactPage={3}
        bookingPage={2}
      />,
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/admin?contactsPage=2&bookingsPage=2");
    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
  });
});
