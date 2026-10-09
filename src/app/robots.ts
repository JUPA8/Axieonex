import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { isIndexingEnabled } from "@/lib/indexing";

export default function robots(): MetadataRoute.Robots {
  // A deployment that is not meant to be indexed should not advertise a
  // sitemap either, or a crawler that ignores the header still has a map of
  // every page to fetch.
  if (!isIndexingEnabled()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    // book-strategy-call and cookie-preferences are noindex,follow via their
    // own page metadata rather than disallowed here, so crawlers can still
    // follow links through them without indexing the pages themselves.
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
