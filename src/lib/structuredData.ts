import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import type { Article, Service } from "@/types/content";

/** Exact byline text rendered on every article page (ArticleTemplate.tsx); reused
 *  here rather than restated, so the two can never silently drift apart. */
export const ARTICLE_BYLINE = "Axieonex editorial team";

/**
 * Only fields backed by real, already-published site facts are included.
 * No sameAs (social profile URLs) is emitted because no such profiles exist
 * in the codebase; adding one would mean inventing a fact.
 */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "customer service",
    },
  };
}

export function buildServiceSchema(service: Service, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.title,
    name: service.title,
    description: service.purpose,
    url: canonicalUrl,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/** Returns null when publishedAt isn't present (only the historical seed
 *  literals in src/content/articles.ts lack it; live DB-backed reads always
 *  carry a real value), so callers can skip emitting the schema rather than
 *  fabricate a date. */
export function buildArticleSchema(article: Article, canonicalUrl: string) {
  if (!article.publishedAt) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.intro,
    url: canonicalUrl,
    datePublished: article.publishedAt,
    author: {
      "@type": "Organization",
      name: ARTICLE_BYLINE,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
    },
  };
}
