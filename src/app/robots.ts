import type { MetadataRoute } from "next";

/** Mirrors the live https://www.axieonex.com/robots.txt (see docs/LIVE_SITE_INVENTORY.md). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.axieonex.com/sitemap.xml",
  };
}
