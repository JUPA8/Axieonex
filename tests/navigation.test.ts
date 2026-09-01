import { describe, expect, it } from "vitest";
import { PRIMARY_NAV, FOOTER_NAV, LEGAL_NAV, SERVICES, SITE } from "@/content/site";

describe("navigation configuration", () => {
  it("every primary nav link has a label and an internal href", () => {
    for (const link of PRIMARY_NAV) {
      expect(link.label.trim().length).toBeGreaterThan(0);
      expect(link.href.startsWith("/")).toBe(true);
    }
  });

  it("every footer nav link has a label and an internal href", () => {
    for (const link of FOOTER_NAV) {
      expect(link.label.trim().length).toBeGreaterThan(0);
      expect(link.href.startsWith("/")).toBe(true);
    }
  });

  it("every legal nav link points at /privacy-policy, /terms-of-service, or /cookies-policy", () => {
    const hrefs = LEGAL_NAV.map((l) => l.href).sort();
    expect(hrefs).toEqual(["/cookies-policy", "/privacy-policy", "/terms-of-service"]);
  });

  it("has exactly the 7 known services, each with a matching slug/href pair", () => {
    expect(SERVICES).toHaveLength(7);
    for (const service of SERVICES) {
      expect(service.href).toBe(`/services/${service.slug}`);
    }
  });

  it("has no duplicate hrefs across primary + footer nav", () => {
    const hrefs = [...PRIMARY_NAV, ...FOOTER_NAV].map((l) => l.href);
    expect(new Set(hrefs).size).toBeLessThanOrEqual(hrefs.length);
  });

  it("SITE config has the expected contact email and legal name", () => {
    expect(SITE.contactEmail).toBe("info@axieonexsales.net");
    expect(SITE.name).toBe("Axieonex");
  });
});
