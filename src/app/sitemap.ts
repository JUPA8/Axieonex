import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/articles";
import { SERVICES } from "@/content/services";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/how-we-work`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/services`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/insights`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}/book-strategy-call`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: now, priority: 0.2 },
    { url: `${SITE_URL}/cookies`, lastModified: now, priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, priority: 0.2 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    lastModified: now,
    priority: 0.8,
  }));

  // Article routes are admin-editable (Phase 2); a DB failure here should
  // shrink the sitemap by a few URLs, not break sitemap.xml generation for
  // the entire site.
  const articles = await getPublishedArticles().catch((error) => {
    console.error("[sitemap] Failed to load articles from the database:", error);
    return [];
  });
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/insights/${article.slug}`,
    lastModified: now,
    priority: 0.5,
  }));

  return [...staticRoutes, ...serviceRoutes, ...articleRoutes];
}
