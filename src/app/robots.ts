import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // book-strategy-call and cookie-preferences are noindex,follow via their
    // own page metadata rather than disallowed here, so crawlers can still
    // follow links through them without indexing the pages themselves.
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
