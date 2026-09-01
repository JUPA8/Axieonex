import type { MetadataRoute } from "next";
import { ARTICLES_CONTENT } from "@/content/articles";
import { LEGAL_CONTENT } from "@/content/legal";
import { SERVICES } from "@/content/site";

const SITE_URL = "https://www.axieonex.com";

/** Mirrors the route list published at https://axieonex.com/sitemap.xml (see docs/ROUTE_INVENTORY.md). */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/pricing", "/articles"];
  const legalRoutes = Object.keys(LEGAL_CONTENT).map((slug) => `/${slug}`);
  const articleRoutes = Object.keys(ARTICLES_CONTENT).map((slug) => `/${slug}`);
  const serviceRoutes = SERVICES.map((s) => s.href);

  const allRoutes = [...staticRoutes, ...legalRoutes, ...articleRoutes, ...serviceRoutes];

  return allRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "daily",
    priority: route === "/" ? 1 : 0.8,
  }));
}
