import { describe, expect, it } from "vitest";
import { ARTICLES, getArticle, getRelatedArticles } from "@/content/articles";
import { SERVICES, getRelatedServices, getService } from "@/content/services";

const CANONICAL_ARTICLE_SLUGS = [
  "ai-human-hybrid-revenue-systems",
  "ai-sales-systems-vs-traditional-teams",
  "why-internal-sdr-hiring-is-broken",
  "cold-outreach-to-revenue-systems",
  "why-ai-sales-tools-fail",
  "in-house-vs-outsourced-revenue-systems",
];

const CANONICAL_SERVICE_SLUGS = [
  "lead-generation",
  "appointment-setting",
  "hybrid-sdr",
  "cold-email",
  "linkedin-outreach",
  "cold-calling",
  "presales-gtm",
];

describe("articles content", () => {
  it("has exactly the 6 canonical slugs from the route manifest", () => {
    expect(ARTICLES.map((a) => a.slug).sort()).toEqual([...CANONICAL_ARTICLE_SLUGS].sort());
  });

  it("has no duplicate slugs", () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every article has non-empty title and body copy", () => {
    for (const article of ARTICLES) {
      expect(article.title.length).toBeGreaterThan(0);
      expect(article.intro.length).toBeGreaterThan(0);
      expect(article.bodyA.length).toBeGreaterThan(0);
      expect(article.bodyB.length).toBeGreaterThan(0);
      expect(article.closing.length).toBeGreaterThan(0);
    }
  });

  it("getArticle resolves a known slug and returns undefined for an unknown one", () => {
    expect(getArticle("why-ai-sales-tools-fail")?.title).toBeTruthy();
    expect(getArticle("does-not-exist")).toBeUndefined();
  });

  it("getRelatedArticles never includes the article itself", () => {
    for (const article of ARTICLES) {
      const related = getRelatedArticles(article.slug);
      expect(related.some((a) => a.slug === article.slug)).toBe(false);
      expect(related.length).toBeLessThanOrEqual(2);
    }
  });
});

describe("services content", () => {
  it("has exactly the 7 canonical service slugs", () => {
    expect(SERVICES.map((s) => s.slug).sort()).toEqual([...CANONICAL_SERVICE_SLUGS].sort());
  });

  it("has no duplicate slugs", () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every service has all required narrative fields and 4 process steps", () => {
    for (const service of SERVICES) {
      expect(service.title.length).toBeGreaterThan(0);
      expect(service.problem.length).toBeGreaterThan(0);
      expect(service.ai.length).toBeGreaterThan(0);
      expect(service.human.length).toBeGreaterThan(0);
      expect(service.control.length).toBeGreaterThan(0);
      expect(service.receive.length).toBeGreaterThan(0);
      expect(service.steps).toHaveLength(4);
      expect(service.faqQ.length).toBeGreaterThan(0);
      expect(service.faqA.length).toBeGreaterThan(0);
    }
  });

  it("getRelatedServices never includes the service itself and returns up to 3", () => {
    for (const service of SERVICES) {
      const related = getRelatedServices(service.slug);
      expect(related.some((s) => s.slug === service.slug)).toBe(false);
      expect(related.length).toBeLessThanOrEqual(3);
    }
  });

  it("getService resolves a known slug and returns undefined for an unknown one", () => {
    expect(getService("hybrid-sdr")?.title).toBe("Hybrid SDR Service");
    expect(getService("does-not-exist")).toBeUndefined();
  });
});
