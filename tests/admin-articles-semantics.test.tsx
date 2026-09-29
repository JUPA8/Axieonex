import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getArticles: vi.fn() }));
vi.mock("@/lib/adminData", () => ({ getAdminArticles: mocks.getArticles }));
vi.mock("@/app/admin/(dashboard)/articles/actions", () => ({
  deleteArticleAction: vi.fn(),
  togglePublishAction: vi.fn(),
}));

import AdminArticlesPage from "@/app/admin/(dashboard)/articles/page";

describe("admin article timestamps", () => {
  it("shows draft status and explicit UTC creation and update timestamps with valid columns", async () => {
    mocks.getArticles.mockResolvedValue([{
      id: "c123456789012345678901234",
      slug: "admin-timestamp-test",
      title: "Admin timestamp test",
      category: "Quality assurance",
      published: false,
      createdAt: new Date("2026-09-25T10:00:00.000Z"),
      updatedAt: new Date("2026-09-25T10:05:00.000Z"),
    }]);

    render(await AdminArticlesPage());
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("columnheader")).toHaveLength(7);
    const row = within(table).getByRole("row", { name: /Admin timestamp test/ });
    expect(row).toHaveTextContent("Draft");
    expect(row).toHaveTextContent("25 Sept 2026, 10:00 UTC");
    expect(row).toHaveTextContent("25 Sept 2026, 10:05 UTC");
  });

  it("keeps the empty-state column count aligned", async () => {
    mocks.getArticles.mockResolvedValue([]);
    render(await AdminArticlesPage());
    expect(screen.getByText("No articles yet.").closest("td")).toHaveAttribute("colspan", "7");
  });
});
