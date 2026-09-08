export const SITE_URL = "https://www.axieonex.com";
export const SITE_NAME = "AXIEONEX";
export const CONTACT_EMAIL = "info@axieonexsales.net";
export const OPERATING_STATEMENT =
  "Operating globally across North America, Europe and selected international markets.";
export const COPYRIGHT_LINE = `© ${new Date().getFullYear()} Axieonex Sales`;

export type NavLink = {
  label: string;
  href: string;
};

export const PRIMARY_NAV: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Insights", href: "/insights" },
];

export const CONTACT_NAV: NavLink = { label: "Contact", href: "/contact" };
export const STRATEGY_CALL_NAV: NavLink = { label: "Book a Strategy Call", href: "/book-strategy-call" };

export const FOOTER_NAV_GROUPS: { title: string; links: NavLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How We Work", href: "/how-we-work" },
      { label: "Insights", href: "/insights" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Lead Generation", href: "/services/lead-generation" },
      { label: "Appointment Setting", href: "/services/appointment-setting" },
      { label: "Hybrid SDR", href: "/services/hybrid-sdr" },
      { label: "Cold Email", href: "/services/cold-email" },
      { label: "LinkedIn Outreach", href: "/services/linkedin-outreach" },
      { label: "Cold Calling", href: "/services/cold-calling" },
      { label: "Pre-Sales & GTM", href: "/services/presales-gtm" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookies Policy", href: "/cookies" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Preferences", href: "/cookie-preferences" },
    ],
  },
];

export type PageTheme =
  | "home"
  | "about"
  | "how-we-work"
  | "services"
  | "service-lead-generation"
  | "service-appointment-setting"
  | "service-hybrid-sdr"
  | "service-cold-email"
  | "service-linkedin-outreach"
  | "service-cold-calling"
  | "service-presales-gtm"
  | "pricing"
  | "insights"
  | "article"
  | "contact"
  | "strategy-call"
  | "legal"
  | "not-found";
