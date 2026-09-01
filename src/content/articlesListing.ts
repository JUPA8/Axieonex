export interface ArticlesListingCard {
  category: string;
  title: string;
  description: string;
  readTime: string;
  href: string;
}

/**
 * Transcribed verbatim from https://axieonex.com/articles. Note the titles,
 * descriptions, categories, and read times here are the live listing page's
 * OWN copy — they intentionally differ from each linked page's own
 * title/meta-description (see docs/ROUTE_INVENTORY.md). This isn't a bug to
 * fix, just how the live site's two content surfaces are written.
 */
export const ARTICLES_LISTING: ArticlesListingCard[] = [
  {
    category: "How We Work",
    title: "How Axieonex Builds Predictable Revenue",
    description: "Discover the synergistic approach that outperforms purely automated systems.",
    readTime: "6 min read",
    href: "/about-axon",
  },
  {
    category: "How We Work",
    title: "How We Work: The Hybrid Model",
    description:
      "Understanding the hybrid approach that replaces traditional SDR teams with intelligent, scalable systems.",
    readTime: "7 min read",
    href: "/how-we-work",
  },
  {
    category: "Pricing",
    title: "Axieonex Pricing Models",
    description: "Transparent, value-based pricing models for AI-orchestrated revenue generation.",
    readTime: "3 min read",
    href: "/pricing",
  },
  {
    category: "Industry Analysis",
    title: "Why Hiring SDRs Is Broken",
    description: "The SDR tenure is shrinking while costs rise. It's time for a new model.",
    readTime: "4 min read",
    href: "/why-hiring-sdrs-broken",
  },
  {
    category: "Comparison",
    title: "AI vs Traditional Sales Teams",
    description: "Comparing cost, efficiency, and scalability of modern sales architectures.",
    readTime: "5 min read",
    href: "/ai-vs-traditional-teams",
  },
  {
    category: "Strategy",
    title: "From Cold Outreach to Revenue",
    description: "Moving beyond simple cold calls to integrated, multi-channel revenue engines.",
    readTime: "5 min read",
    href: "/cold-outreach-to-revenue",
  },
  {
    category: "Technology",
    title: "Why AI Tools Fail Without Humans",
    description: "Automation without strategy creates noise. Learn how to avoid the trap.",
    readTime: "4 min read",
    href: "/ai-sales-tools-fail",
  },
  {
    category: "Legal",
    title: "Privacy Policy",
    description: "How we collect, use, and protect your personal data.",
    readTime: "8 min read",
    href: "/privacy-policy",
  },
  {
    category: "Legal",
    title: "Terms of Service",
    description: "The terms and conditions governing the use of Axieonex services.",
    readTime: "10 min read",
    href: "/terms-of-service",
  },
  {
    category: "Legal",
    title: "Cookies Policy",
    description: "Information about how we use cookies and tracking technologies.",
    readTime: "3 min read",
    href: "/cookies-policy",
  },
];
