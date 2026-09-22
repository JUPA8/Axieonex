import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), contact: vi.fn(), booking: vi.fn(), articles: vi.fn(), article: vi.fn() }));
vi.mock("@/lib/adminAuthorization", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/prisma", () => ({ prisma: {
  contactSubmission: { findMany: mocks.contact }, bookingRequest: { findMany: mocks.booking },
  article: { findMany: mocks.articles, findUnique: mocks.article },
} }));

import { getAdminArticle, getAdminArticles, getAdminSubmissions } from "@/lib/adminData";

describe("admin sensitive reads", () => {
  it.each([
    ["submissions", () => getAdminSubmissions()],
    ["articles", () => getAdminArticles()],
    ["article", () => getAdminArticle("article-1")],
  ])("blocks %s before querying", async (_name, invoke) => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("Not authorized."));
    await expect(invoke()).rejects.toThrow("Not authorized.");
    expect(mocks.contact).not.toHaveBeenCalled();
    expect(mocks.booking).not.toHaveBeenCalled();
    expect(mocks.articles).not.toHaveBeenCalled();
    expect(mocks.article).not.toHaveBeenCalled();
  });
});
