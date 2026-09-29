import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), findUnique: vi.fn(), findUniqueOrThrow: vi.fn(),
}));
vi.mock("@/lib/adminAuthorization", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/prisma", () => ({ prisma: { article: {
  create: mocks.create, update: mocks.update, delete: mocks.remove,
  findUnique: mocks.findUnique, findUniqueOrThrow: mocks.findUniqueOrThrow,
} } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { createArticleAction, deleteArticleAction, togglePublishAction, updateArticleAction } from "@/app/admin/(dashboard)/articles/actions";

function articleForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({ slug: "safe", title: "Title", category: "News", color: "#123456", intro: "Intro", h2a: "A", bodyA: "Body A", h2b: "B", bodyB: "Body B", closing: "Close" })) form.set(key, value);
  return form;
}

describe("article mutation authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockRejectedValue(new Error("Not authorized."));
  });

  it.each([
    ["create", () => createArticleAction({}, articleForm())],
    ["update", () => updateArticleAction("article-1", {}, articleForm())],
    ["delete", () => deleteArticleAction("article-1")],
    ["toggle", () => togglePublishAction("article-1")],
  ])("blocks %s before any database mutation", async (_name, invoke) => {
    await expect(invoke()).rejects.toThrow("Not authorized.");
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it("allows all four operations for an active authorized admin", async () => {
    mocks.requireAdmin.mockResolvedValue({ id: "admin-1", email: "a@example.com" });
    mocks.remove.mockResolvedValue({ slug: "safe" });
    mocks.findUnique.mockResolvedValue({ publishedAt: null });
    mocks.findUniqueOrThrow.mockResolvedValue({ slug: "safe", published: false, publishedAt: null });
    await createArticleAction({}, articleForm());
    await updateArticleAction("article-1", {}, articleForm());
    await deleteArticleAction("article-1");
    await togglePublishAction("article-1");
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.update).toHaveBeenCalledTimes(2);
    expect(mocks.remove).toHaveBeenCalledWith({ where: { id: "article-1" } });
  });
});
