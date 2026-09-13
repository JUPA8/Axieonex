import { describe, expect, it } from "vitest";
import { ARTICLE_BYLINE, buildArticleSchema, buildOrganizationSchema, buildServiceSchema } from "@/lib/structuredData";
import type { Article, Service } from "@/types/content";

const SERVICE: Service = {
  slug: "lead-generation",
  title: "Lead Generation",
  role: "role",
  accent: "#3E7BFA",
  visual: "radar",
  purpose: "Finds accounts ready to buy.",
  problem: "p",
  ai: "a",
  human: "h",
  control: "c",
  receive: "r",
  channels: "ch",
  quality: "q",
  steps: [],
  faqQ: "q",
  faqA: "a",
  ecosystem: {
    label: "l",
    tag: "t",
    purpose: "p",
    aiPerforms: "a",
    humansPerform: "h",
    youReceive: "y",
    x: 0,
    y: 0,
    labelSide: "above",
  },
};

const ARTICLE: Article = {
  slug: "test-article",
  title: "Test Article",
  category: "Strategy",
  color: "#3E7BFA",
  intro: "Intro text.",
  h2a: "First",
  bodyA: "Body A",
  h2b: "Second",
  bodyB: "Body B",
  closing: "Closing",
  publishedAt: "2026-01-01T00:00:00.000Z",
};

describe("buildOrganizationSchema", () => {
  it("includes only real, already-published facts", () => {
    const schema = buildOrganizationSchema();
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("AXIEONEX");
    expect(schema).not.toHaveProperty("sameAs");
  });
});

describe("buildServiceSchema", () => {
  it("maps the service's real title/purpose onto the schema", () => {
    const schema = buildServiceSchema(SERVICE, "https://www.axieonex.com/services/lead-generation");
    expect(schema["@type"]).toBe("Service");
    expect(schema.name).toBe("Lead Generation");
    expect(schema.description).toBe("Finds accounts ready to buy.");
    expect(schema.url).toBe("https://www.axieonex.com/services/lead-generation");
  });
});

describe("buildArticleSchema", () => {
  it("returns null when publishedAt is absent rather than fabricate a date", () => {
    const withoutDate: Article = { ...ARTICLE, publishedAt: undefined };
    expect(buildArticleSchema(withoutDate, "https://www.axieonex.com/insights/test-article")).toBeNull();
  });

  it("uses the real rendered byline as an Organization-type author, and the real publishedAt as datePublished", () => {
    const schema = buildArticleSchema(ARTICLE, "https://www.axieonex.com/insights/test-article");
    expect(schema).not.toBeNull();
    expect(schema?.["@type"]).toBe("Article");
    expect(schema?.datePublished).toBe("2026-01-01T00:00:00.000Z");
    expect(schema?.author).toEqual({ "@type": "Organization", name: ARTICLE_BYLINE });
  });
});
