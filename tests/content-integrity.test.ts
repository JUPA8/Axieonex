import { describe, expect, it } from "vitest";
import { ARTICLES_CONTENT, ARTICLES_ORDER } from "@/content/articles";
import { LEGAL_CONTENT } from "@/content/legal";
import { SERVICES_CONTENT } from "@/content/services";
import { SERVICES } from "@/content/site";
import { ARTICLES_LISTING } from "@/content/articlesListing";
import { HOME_ARTICLES_SECTION } from "@/content/homepage";

describe("route/content integrity", () => {
  it("every article's href matches its own slug", () => {
    for (const article of Object.values(ARTICLES_CONTENT)) {
      expect(article.href).toBe(`/${article.slug}`);
    }
  });

  it("ARTICLES_ORDER only references slugs that exist in ARTICLES_CONTENT", () => {
    for (const slug of ARTICLES_ORDER) {
      expect(ARTICLES_CONTENT[slug]).toBeDefined();
    }
  });

  it("every legal page has at least one section", () => {
    for (const legal of Object.values(LEGAL_CONTENT)) {
      expect(legal.sections.length).toBeGreaterThan(0);
    }
  });

  it("every service in SERVICES has matching content in SERVICES_CONTENT", () => {
    for (const service of SERVICES) {
      expect(SERVICES_CONTENT[service.slug]).toBeDefined();
      expect(SERVICES_CONTENT[service.slug].slug).toBe(service.slug);
    }
  });

  it("every service page has all 5 required content sections", () => {
    for (const service of Object.values(SERVICES_CONTENT)) {
      expect(service.whatWeDo.length).toBeGreaterThan(0);
      expect(service.whyThisWorks.length).toBeGreaterThan(0);
      expect(service.whoThisIsFor.length).toBeGreaterThan(0);
      expect(service.ctaHeading.length).toBeGreaterThan(0);
      expect(service.ctaButton.length).toBeGreaterThan(0);
    }
  });

  it("the homepage's featured article slugs all resolve to real articles (regression test for the live site's mislinked cards — see docs/CURRENT_SITE_AUDIT.md §1)", () => {
    for (const slug of HOME_ARTICLES_SECTION.featuredSlugs) {
      const article = ARTICLES_CONTENT[slug];
      expect(article, `missing article content for slug "${slug}"`).toBeDefined();
      expect(article.href).toBe(`/${slug}`);
    }
  });

  it("every /articles listing card href points at a route that actually exists (an article, a legal page, or /pricing)", () => {
    for (const card of ARTICLES_LISTING) {
      const slug = card.href.replace(/^\//, "");
      const isKnown =
        card.href === "/pricing" || Boolean(ARTICLES_CONTENT[slug]) || Boolean(LEGAL_CONTENT[slug]);
      expect(isKnown, `unknown route referenced by articles listing: ${card.href}`).toBe(true);
    }
  });
});
