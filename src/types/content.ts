export interface NavLink {
  label: string;
  href: string;
}

export interface ServiceSummary {
  slug: string;
  label: string;
  href: string;
}

export interface ServiceContent {
  slug: string;
  title: string;
  metaDescription: string;
  description: string;
  whatWeDo: string[];
  whyThisWorksHeading: string;
  whyThisWorks: string;
  whoThisIsForHeading: string;
  whoThisIsFor: string;
  badge: string | null;
  ctaHeading: string;
  ctaButton: string;
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export type ArticleCategory =
  | "HOW WE WORK"
  | "STRATEGY"
  | "INDUSTRY TRENDS"
  | "OPINION"
  | "SALES TACTICS"
  | "TECHNOLOGY"
  | "ROI"
  | "PRICING"
  | "LEGAL";

export interface ArticleContent {
  slug: string;
  href: string;
  title: string;
  category: ArticleCategory;
  readTime: string;
  metaDescription: string;
  description: string;
  leadParagraphs: string[];
  sections: ArticleSection[];
}

export interface LegalSection {
  number: string;
  heading: string;
  paragraphs: string[];
}

export interface LegalContent {
  slug: string;
  title: string;
  tagline: string;
  lastUpdated: string;
  metaDescription: string;
  sections: LegalSection[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Where a given piece of on-page data comes from — see docs/DATA_PROVENANCE.md. */
export type Provenance = "source-verbatim" | "reconstructed-structure" | "placeholder";
