import type { NavLink, ServiceSummary } from "@/types/content";

/**
 * Single source of truth for site-wide identity, navigation, and contact
 * details, transcribed verbatim from the live site (see
 * docs/LIVE_SITE_INVENTORY.md). Nothing here is invented.
 */
export const SITE = {
  name: "Axieonex",
  legalName: "Axieonex Sales",
  tagline: "AI-Powered Revenue Engine",
  description:
    "Axieonex operates AI-orchestrated outbound sales engines combining AI tools, CRM systems, and human expertise to generate qualified revenue pipelines.",
  footerTagline: "AI-powered sales systems built for modern B2B companies.",
  copyright: "© 2026 Axieonex Sales. All rights reserved.",
  contactEmail: "info@axieonexsales.net",
  operatingRegion:
    "Operating Globally - Serving clients across North America, Europe, and selected international markets.",
} as const;

export const SERVICES: ServiceSummary[] = [
  { slug: "lead-generation", label: "Lead Generation", href: "/services/lead-generation" },
  { slug: "appointment-setting", label: "Appointment Setting", href: "/services/appointment-setting" },
  { slug: "hybrid-sdr", label: "Hybrid SDR Service", href: "/services/hybrid-sdr" },
  { slug: "cold-email", label: "Cold Email & Messaging", href: "/services/cold-email" },
  { slug: "linkedin-outreach", label: "LinkedIn Outreach", href: "/services/linkedin-outreach" },
  { slug: "cold-calling", label: "Cold Calling", href: "/services/cold-calling" },
  { slug: "presales-gtm", label: "Pre-Sales & GTM Strategy", href: "/services/presales-gtm" },
];

export const PRIMARY_NAV: NavLink[] = [
  { label: "About Axieonex", href: "/about-axon" },
  { label: "Blogs", href: "/articles" },
  { label: "Pricing", href: "/pricing" },
];

export const FOOTER_NAV: NavLink[] = [
  { label: "About Axieonex", href: "/about-axon" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Blogs", href: "/articles" },
  { label: "Pricing", href: "/pricing" },
];

export const LEGAL_NAV: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookies Policy", href: "/cookies-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];
