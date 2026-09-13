import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import type { Service } from "@/types/content";

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
