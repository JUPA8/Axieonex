import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd, serializeJsonLd } from "@/components/seo/JsonLd";
import { SERVICES } from "@/content/services";
import { buildArticleSchema, buildOrganizationSchema, buildServiceSchema } from "@/lib/structuredData";

describe("JSON-LD serialization", () => {
  it("escapes every HTML-significant and JavaScript line-separator character without changing values", () => {
    const hostile = { title: "</script><script>alert(1)</script>", intro: "A & B > C", description: "line\u2028separator", author: "para\u2029graph" };
    const serialized = serializeJsonLd(hostile);
    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");
    expect(serialized).not.toContain("&");
    expect(serialized).not.toContain("\u2028");
    expect(serialized).not.toContain("\u2029");
    expect(JSON.parse(serialized)).toEqual(hostile);
  });

  it("uses the safe serializer in the rendered script", () => {
    const { container } = render(<JsonLd data={{ headline: "</script>" }} />);
    expect(container.querySelector("script")?.innerHTML).toBe('{"headline":"\\u003c/script\\u003e"}');
  });

  it("keeps Organization, Service, and Article schemas renderable and parseable", () => {
    const article = { slug: "safe", title: "Title", category: "Security", color: "#123456", intro: "Description", h2a: "A", bodyA: "A", h2b: "B", bodyB: "B", closing: "C", publishedAt: "2026-09-22T00:00:00.000Z" };
    const schemas = [
      buildOrganizationSchema(),
      buildServiceSchema(SERVICES[0], "https://www.axieonex.com/services/lead-generation"),
      buildArticleSchema(article, "https://www.axieonex.com/insights/safe"),
    ];
    expect(schemas.map((schema) => JSON.parse(serializeJsonLd(schema!))["@type"])).toEqual(["Organization", "Service", "Article"]);
  });
});
