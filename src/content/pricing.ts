export type PricingTier = {
  name: string;
  price: string;
  description: string;
};

export const PRICING_TIERS: PricingTier[] = [
  { name: "Foundation", price: "Custom", description: "Single market, one or two channels. For teams testing a coordinated system for the first time." },
  { name: "Growth", price: "Custom", description: "Multi-channel orchestration across one or two markets, with dedicated human qualification." },
  { name: "Scale", price: "Custom", description: "Full-channel coverage across multiple markets, with strategy involvement and deep reporting." },
  {
    name: "Custom Revenue System",
    price: "Contact for scope",
    description: "Built end to end around a complex GTM motion, multiple business units, or unusual markets.",
  },
];

export const PRICING_DISCLAIMER =
  "Final pricing is confirmed on a strategy call once scope, channels and market coverage are defined. Nothing above is a published rate.";

export const COMPARISON_ROWS: { label: string; values: [string, string, string, string] }[] = [
  { label: "Market coverage", values: ["1 market", "1 to 2 markets", "Multiple markets", "Defined with you"] },
  { label: "Channels included", values: ["1 to 2 channels", "Email, LinkedIn, calling", "Full channel coverage", "Defined with you"] },
  { label: "Signal intelligence", values: ["Standard", "Enhanced", "Continuous, multi-source", "Defined with you"] },
  { label: "Human involvement", values: ["Validation and qualification", "Dedicated strategist", "Senior strategist and analyst team", "Defined with you"] },
  { label: "Reporting", values: ["Monthly summary", "Bi-weekly reporting", "Real-time dashboard access", "Defined with you"] },
  { label: "Strategy support", values: ["Onboarding only", "Quarterly review", "Ongoing GTM strategy input", "Defined with you"] },
];

export const PRICING_FAQ = [
  {
    question: "Why is there no fixed price list?",
    answer:
      "Because scope varies by market, channel count and required human involvement. A fixed menu would either overcharge simple engagements or undercut complex ones.",
  },
  {
    question: "How is scope decided?",
    answer:
      "On a strategy call, we map your market, channels and desired qualification depth, then propose the closest tier and adjust it to fit.",
  },
  {
    question: "Can an engagement change tiers later?",
    answer: "Yes. Most clients start narrower and expand market or channel coverage once the initial system is proven.",
  },
];
