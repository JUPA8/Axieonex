import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublishedArticleBySlug, getPublishedArticles, getRelatedPublishedArticles } from "@/lib/articles";

describe("DB-backed article helpers (no DATABASE_URL in the test environment)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws rather than silently returning fake data when the database isn't configured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    await expect(getPublishedArticles()).rejects.toThrow();
  });

  it("callers are expected to catch this: getPublishedArticleBySlug also throws", async () => {
    vi.stubEnv("DATABASE_URL", "");
    await expect(getPublishedArticleBySlug("any-slug")).rejects.toThrow();
  });

  it("callers are expected to catch this: getRelatedPublishedArticles also throws", async () => {
    vi.stubEnv("DATABASE_URL", "");
    await expect(getRelatedPublishedArticles("any-slug")).rejects.toThrow();
  });
});
