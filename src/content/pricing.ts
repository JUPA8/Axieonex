import type { FaqItem } from "@/types/content";

/** Transcribed verbatim from https://axieonex.com/pricing (see docs/ROUTE_INVENTORY.md). */
export const PRICING_HERO = {
  heading: "Build a Sales Engine — Not Just Buy Leads",
  subheading:
    "Invest in a complete AI-powered, human-guided revenue system. No hidden fees, no vanity metrics—just predictable pipeline growth.",
};

export const PRICING_PHILOSOPHY = {
  heading: "Our Pricing Philosophy",
  body:
    "We sell outcomes. Our pricing is designed to align our incentives with yours: building a sustainable, scalable revenue engine that delivers ROI measured in closed deals, not just open rates.",
};

export const PRICING_MODELS = {
  heading: "How Our Pricing Works",
  intro: "Choose the model that fits your growth stage.",
  models: [
    {
      name: "Strategic Retainer Model",
      subtitle: "Best for predictable, long-term growth.",
      headline: "Custom Monthly Investment",
      body:
        "A dedicated team and AI infrastructure focused on continuous optimization. We become your fully managed outbound department.",
      features: ["Dedicated Campaign Strategist", "Unlimited AI Outreach Volume", "Full Tech Stack Included"],
      cta: "Book a Strategy Call",
    },
    {
      name: "Performance-Based Model",
      subtitle: "Best for scaling specific campaigns.",
      headline: "Pay Per Qualified Outcome",
      body:
        "Pay only for the results we generate. Pricing ranges based on lead seniority, industry difficulty, and qualification criteria.",
      features: ["Per Qualified Lead", "Per Booked Meeting"],
      cta: "Get a Custom Quote",
    },
  ],
};

export const PRICING_INCLUDED = {
  heading: "What's Included (No Hidden Costs)",
  items: [
    "ICP Development & Data Refinement",
    "AI-Assisted Market Research",
    "Multi-Channel Outreach (Email, LinkedIn, Phone)",
    "AI Agents + Human Supervision",
    "Lead Qualification & Response Handling",
    "Real-Time CRM Reporting",
    "Ongoing Campaign Optimization",
  ],
};

export const PRICING_WHY = {
  heading: "Why Axieonex?",
  reasons: [
    {
      title: "Hybrid Execution",
      body: "We combine AI speed with human empathy. You get the scale of a machine and the strategy of an expert.",
    },
    {
      title: "Total System Design",
      body:
        "We don't just send emails. We build a comprehensive revenue engine that integrates with your CRM and sales workflow.",
    },
    {
      title: "SDR Replacement",
      body:
        "For less than the cost of one junior hire, you get a full-stack outbound team that never sleeps and never churns.",
    },
  ],
};

export const PRICING_ROI = {
  heading: "The ROI Calculation",
  rows: [
    { label: "Avg. Cost of Internal SDR", value: "$85,000/yr +" },
    { label: "Software & Data Costs", value: "$15,000/yr +" },
    { label: "Management Time", value: "200+ hours/yr" },
    { label: "Axieonex Investment", value: "~60% Less" },
  ],
  footnote: "Based on industry averages for US-based B2B tech companies.",
};

export const PRICING_FAQS: FaqItem[] = [
  {
    question: "Do you have fixed pricing packages?",
    answer:
      "No, because every market is different. We tailor our pricing based on your specific industry, deal size, and growth targets. This ensures you only pay for the resources required to hit your goals.",
  },
  {
    question: "Are there long-term contracts?",
    answer:
      "Our standard engagement starts with a 3-month pilot to build statistical significance and optimize the engine. After that, we move to a rolling monthly agreement. We believe our results should keep you as a partner, not a contract.",
  },
  {
    question: "Is this suitable for early-stage startups?",
    answer:
      "Axieonex works best for companies with a proven product-market fit and an ACV (Annual Contract Value) of $10k+. If you are still figuring out what you sell, we might not be the right fit yet.",
  },
  {
    question: "How do we get started?",
    answer:
      "Book a strategy call. We'll analyze your current sales process, identify the gaps, and propose a custom engine design. If we agree on the targets, we can launch in as little as 14 days.",
  },
];

export const PRICING_FINAL_CTA = {
  heading: "Ready to Scale?",
  body: "Design your outbound system. Get clarity on pricing, scope, and expected outcomes.",
  note: "No pressure. No generic pitch. Just a real growth conversation.",
  cta: "Get Free Demo",
};
