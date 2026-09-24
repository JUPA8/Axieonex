import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("@/lib/adminData", () => ({ getAdminSubmissions: vi.fn(async () => [[], []]) }));

import AdminDashboardPage from "@/app/admin/(dashboard)/page";

describe("admin dashboard semantics", () => {
  it("has one page heading, subordinate section headings, and matching empty-row spans", async () => {
    render(await AdminDashboardPage());

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Admin dashboard" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);

    const tables = screen.getAllByRole("table");
    expect(within(tables[0]).getByText("No submissions yet.").closest("td")).toHaveAttribute("colspan", "6");
    expect(within(tables[1]).getByText("No requests yet.").closest("td")).toHaveAttribute("colspan", "8");
  });
});
