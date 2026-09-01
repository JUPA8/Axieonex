import type { FaqItem } from "@/types/content";

/**
 * Transcribed verbatim from https://axieonex.com/ (see
 * docs/ROUTE_INVENTORY.md). The featured-article hrefs below point at the
 * article whose title actually matches the card, correcting the live site's
 * mislinked homepage cards — see docs/CURRENT_SITE_AUDIT.md §1 and
 * docs/RECONSTRUCTION_REPORT.md for the approved decision to fix this.
 */
export const HOME_HERO = {
  eyebrow: "AI Appointment Setting Services & Lead Generation",
  heading: "We Build Revenue Pipelines — Not Just Meetings.",
  subheading:
    "Axieonex replaces the complexity of hiring, training, and managing SDR teams with AI-powered outbound systems and human expertise — designed for predictable, scalable growth.",
  primaryCta: "Get a Free Demo",
  secondaryCta: "See How It Works",
  secondaryHref: "/how-we-work",
};

export const HOME_HOW_IT_WORKS = {
  heading: "How Axieonex Works — AI-Orchestrated, Human-Driven Revenue Engine",
  intro:
    "Axieonex builds and runs a hybrid revenue engine where AI handles signal detection, prioritization, and orchestration, while expert sales professionals execute, supervise, and optimize every step to ensure real conversations and real deals. We don't automate sales — we orchestrate it.",
  pillars: [
    {
      title: "Signal-Based Market Intelligence",
      description:
        "We don't just pull lists. Our AI continuously scans the market for high-intent buying signals — funding, hiring, tech stack changes — to identify companies ready to buy now. Every lead is validated by human analysts to prioritize quality over volume.",
    },
    {
      title: "AI-Orchestrated, Human-Executed Outreach",
      description:
        "Our proprietary system crafts hyper-personalized messaging at scale, while experienced sales strategists oversee the tone, timing, and multi-channel cadence. It's the speed of AI with the nuance of a top-performing human rep.",
    },
    {
      title: "Revenue-Ready Conversations Only",
      description:
        "We filter out the noise. Our team manages responses, qualifies interest, and handles objections. You only step in when a prospect is ready to discuss a deal. No wasted time on tire-kickers.",
    },
  ],
  closing:
    "The result: predictable pipeline growth, zero internal hiring burden, and consistent revenue conversations — without losing control or brand quality. Axieonex operates your revenue engine so your team can focus on closing.",
};

export const HOME_ARTICLES_SECTION = {
  heading: "Learn More About Axieonex — Insights and Thought Leadership",
  intro:
    "Explore our latest insights on AI-assisted outbound sales, hybrid revenue systems, and modern pipeline acceleration.",
  /** Slugs into ARTICLES_CONTENT, in the order the live homepage shows them. */
  featuredSlugs: [
    "ai-human-hybrid-model",
    "ai-vs-traditional-teams",
    "why-hiring-sdrs-broken",
    "cold-outreach-to-revenue",
    "ai-sales-tools-fail",
    "cost-inhouse-vs-outsourced",
  ] as const,
};

export const HOME_FAQS: FaqItem[] = [
  {
    question: "How does Axieonex differ from traditional lead gen or SDR agencies?",
    answer:
      "Traditional agencies often rely solely on list building or hours worked. Axieonex operates a comprehensive managed revenue system. We orchestrate the entire process using AI and human expertise to deliver qualified, revenue-ready conversations.",
  },
  {
    question: "What role does AI play in the Axieonex system?",
    answer:
      "AI handles signal detection, account prioritization, and personalization at scale. Expert humans then supervise the process to ensure strategy, nuance, and quality control are maintained.",
  },
  {
    question: "Which industries does Axieonex serve?",
    answer:
      "We specialize in complex B2B sectors such as SaaS, Technology Services, Enterprise Software, and Fintech—environments where deal cycles are longer and require a sophisticated approach.",
  },
  {
    question: "What is the timeline to see results?",
    answer:
      "Campaigns typically launch within 14 days. Initial data appears within 4-6 weeks as we refine messaging. By weeks 8-12, the system usually reaches statistical significance and consistent pipeline generation.",
  },
  {
    question: "Is Axieonex a SaaS tool or a managed service?",
    answer:
      "We are a managed service partner. We utilize advanced AI tools but operate the engine for you, allowing your team to focus on closing deals.",
  },
  {
    question: "Can Axieonex replace an internal SDR team?",
    answer:
      "Yes. Our hybrid system creates the output of a full team by eliminating the overhead of hiring, training, and turnover.",
  },
  {
    question: "Is the outreach customized to our brand?",
    answer:
      "Absolutely. Our strategy team designs custom Ideal Customer Profiles (ICPs) and messaging frameworks tailored to your value proposition and brand voice.",
  },
  {
    question: "What success metrics do you track?",
    answer:
      "We track revenue-focused metrics: Qualified Conversations, Booked Meetings, Pipeline Value Generated, Cost Per Opportunity, and Conversion Rates.",
  },
];

export const HOME_FINAL_CTA = {
  heading: "Ready to Accelerate Your Pipeline?",
  body:
    "While you wait, your competitors are already reaching your buyers using AI-orchestrated outbound systems. AI isn't a competitive edge anymore — it's the baseline. Axieonex helps you scale your sales pipeline faster, smarter, and with precision. Start now.",
  primaryCta: "Get a Free Demo",
  secondaryCta: "See how we work",
  secondaryHref: "/how-we-work",
};
