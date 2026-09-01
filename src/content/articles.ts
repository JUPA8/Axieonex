import type { ArticleContent } from "@/types/content";

/**
 * Transcribed verbatim from the 8 blog-style content pages on the live site
 * (see docs/ROUTE_INVENTORY.md and docs/CURRENT_SITE_AUDIT.md §1 for the
 * homepage-mislink finding this data corrects).
 */
export const ARTICLES_CONTENT: Record<string, ArticleContent> = {
  "about-axon": {
    slug: "about-axon",
    href: "/about-axon",
    title: "How Axieonex Builds Predictable Revenue Using an AI + Human Hybrid Model",
    category: "HOW WE WORK",
    readTime: "5–7 MINUTES READ",
    metaDescription: "A modern approach to outbound sales that replaces fragmented tools and traditional SDR teams with scalable, intelligent systems.",
    description: "A modern approach to outbound sales that replaces fragmented tools and traditional SDR teams with scalable, intelligent systems.",
    leadParagraphs: ["The traditional approach to outbound sales is often inefficient. Companies hire expensive SDR teams, burn through leads with generic messaging, and suffer from high turnover. Axieonex was built to fix this fundamental flaw in the B2B growth engine."],
    sections: [
      { heading: "What Axieonex Is — And Why We Built It", paragraphs: ["Axieonex is a complete outbound sales infrastructure. We replace the manual process of building an internal SDR team with a unified system that runs on autopilot but is guided by expert human strategy.", "We built Axieonex because we saw B2B companies struggling with the same cycle:", "Spending months hiring and training SDRs who ramp slowly.", "Buying expensive, disconnected data tools.", "Seeing results plateau as soon as a top performer leaves.", "We realized that the problem wasn't the people—it was the model. Machines should do the heavy lifting, and humans should do the closing.", "The Old Way vs. The Axieonex Way", "Traditional models rely on human volume. Axieonex relies on system precision. We shift the burden from headcount to compute power."] },
      { heading: "What Axieonex Actually Does", paragraphs: ["We build, manage, and optimize your entire outbound revenue pipeline. When you partner with Axieonex, we install a system.", "1. We Build Your Audience (Data & Targeting)", "Our system aggregates data from multiple live sources to identify companies that are actually in-market for your solution. We look for buying signals—funding news, hiring spikes, tech stack changes—not just job titles.", "2. We Craft Your Message (Strategy & Copy)", "AI writes the drafts, but our strategists design the architecture. We create multi-touch sequences that sound human, relevant, and helpful.", "3. We Launch & Optimize (Execution)", "Our system handles the sending, the follow-ups, and the channel orchestration (Email, LinkedIn, etc.). We constantly A/B test subject lines, value props, and send times to maximize positive reply rates."] },
      { heading: "Who Axieonex Is Built For", paragraphs: ["Axieonex is designed for B2B companies selling high-value solutions ($10k+ ACV) who need consistent pipeline growth without the operational headache of managing a large sales team.", "Founders & CEOs", "Who are tired of relying on founder-led sales and need a system that scales beyond their personal network.", "VP of Sales / CROs", "Who want their AEs focused on closing deals, not wasting time researching prospects.", "From Chaos to Clarity", "We turn the chaotic art of prospecting into a predictable science. Input qualified leads -> Process with AI Strategy -> Output revenue opportunities."] },
      { heading: "Why Axieonex Is Different", paragraphs: ["Axieonex is a Hybrid Partner.", "Transparency: You own the data. You see the metrics. You approve the messaging.", "Technology + Talent: We don't just give you a login. We give you a dedicated campaign strategist backed by our proprietary AI stack.", "Outcome-Focused: We measure success in qualified meetings and pipeline revenue."] },
      { heading: "The Outcome We Focus On", paragraphs: ["Our goal is simple: Predictable Revenue.", "By removing the variability of human burnout and manual error, we create a sales channel that you can forecast with confidence."] },
      { heading: "Our Philosophy", paragraphs: ["\"Sales is not about tricking people into a meeting. It's about identifying a problem you can solve and starting a conversation with the person who has that problem.\"", "We believe that automation shouldn't feel robotic. It should feel helpful. We use AI to enable scale, but we use human empathy to build connection. That is the Axieonex difference."] },
    ],
  },
  "how-we-work": {
    slug: "how-we-work",
    href: "/how-we-work",
    title: "How We Work: The AI + Human Hybrid Model That Replaces Traditional Sales Teams",
    category: "HOW WE WORK",
    readTime: "6–8 MINUTES READ",
    metaDescription: "Understanding the hybrid approach that replaces traditional SDR teams with intelligent, scalable systems.",
    description: "Understanding the hybrid approach that replaces traditional SDR teams with intelligent, scalable systems.",
    leadParagraphs: ["The B2B sales landscape has shifted. The tactics that worked five years ago—mass cold calling, generic email blasts, and hiring armies of junior SDRs—are yielding diminishing returns. At Axieonex, we've engineered a new way to work: a hybrid model that fuses AI scalability with human strategic oversight."],
    sections: [
      { heading: "Why Traditional Sales Teams Break at Scale", paragraphs: ["Scaling a human-only sales team is linear and expensive. To double your output, you usually have to double your headcount. This brings massive overhead: recruiting costs, training time, management layers, and the inevitable churn.", "Furthermore, humans are inconsistent. A bad day, burnout, or a lack of motivation directly impacts pipeline generation. In the traditional model, your revenue growth is capped by how many calls your team can physically make in a day.", "The Efficiency Gap", "A human SDR can research and personalize ~50 emails a day. Axieonex's system can research and personalize 5,000+ with the same level of relevance."] },
      { heading: "Why AI Alone Is Not the Answer", paragraphs: ["Conversely, fully automated \"spam cannons\" damage your brand. If you let an AI run wild without supervision, it will hallucinate, misinterpret context, and send tone-deaf messages.", "Buyers are savvy. They can smell a generic, AI-generated email from a mile away. Pure automation lacks nuance. It lacks the ability to understand complex business context or navigate a sensitive reply."] },
      { heading: "Axieonex's Hybrid Approach", paragraphs: ["We sit right in the middle. We treat AI as the \"engine\" and humans as the \"drivers.\"", "1. AI Handles the Data & Research", "Our systems scrape the web, enrich contact data, and identify buying signals (funding, hiring, news) at a speed no human can match.", "2. AI Drafts the Outreach", "LLMs generate personalized messaging based on the research. It references specific pain points relevant to that prospect's industry and role.", "3. Humans Validate & Strategize", "This is the critical step. Our expert campaign managers review the strategy, tweak the messaging frameworks, and monitor the AI's performance to ensure quality control.", "Orchestration is Key", "It's not just email. Our hybrid model orchestrates touchpoints across LinkedIn, Email, and even Cold Calls, ensuring a cohesive buyer journey."] },
      { heading: "How This Replaces Traditional SDR Teams", paragraphs: ["Instead of hiring 3 SDRs, you hire Axieonex. We become your outbound department.", "No ramping time: We plug in our system and start prospecting in days, not months.", "No management overhead: You don't need to motivate or manage our AI. It just works.", "Continuous Learning: Unlike a rep who might leave and take their knowledge with them, our system retains data. Every \"no\" teaches the AI how to get a \"yes\" next time."] },
      { heading: "Why This Model Works Long-Term", paragraphs: ["Sales is becoming more data-driven. The companies that win will be the ones who can process the most data to find the highest-intent prospects. Our hybrid model is future-proof because it adapts. As AI models get better, our system gets smarter. As market conditions change, our human strategists pivot the approach."] },
      { heading: "What Clients Experience", paragraphs: ["Clients experience silence, then results.", "You don't hear the grinding gears of prospecting. You don't see the thousands of emails sent or the data being enriched. You just see qualified meetings appearing on your calendar and a pipeline report that grows week over week. It's outbound sales, simplified."] },
      { heading: "The Axieonex Standard", paragraphs: ["We hold ourselves to a standard of \"Revenue Intelligence.\" We are not just appointment setters; we are revenue architects. We build the systems that build your business."] },
    ],
  },
  "ai-human-hybrid-model": {
    slug: "ai-human-hybrid-model",
    href: "/ai-human-hybrid-model",
    title: "How We Use an AI + Human Hybrid Model to Build Predictable Revenue",
    category: "STRATEGY",
    readTime: "6 MIN READ",
    metaDescription: "Why the best results come from man and machine working together.",
    description: "Why the best results come from man and machine working together.",
    leadParagraphs: ["Pure automation feels robotic. Pure manual work is unscalable. The sweet spot is in the middle.", "We leverage LLMs to draft hyper-personalized emails, but a human reviews the strategy to ensure tone and relevance remain high."],
    sections: [
    ],
  },
  "ai-vs-traditional-teams": {
    slug: "ai-vs-traditional-teams",
    href: "/ai-vs-traditional-teams",
    title: "AI-Powered Sales Systems vs. Traditional Human Teams — Why the Future of Lead Generation Is Hybrid",
    category: "INDUSTRY TRENDS",
    readTime: "5 MIN READ",
    metaDescription: "A comparative analysis of efficiency, cost, and results.",
    description: "A comparative analysis of efficiency, cost, and results.",
    leadParagraphs: ["Traditional teams suffer from burnout, ramp time, and inconsistency. AI systems run 24/7 without fatigue.", "However, AI lacks nuance. That's why we embed human oversight into every automated workflow."],
    sections: [
    ],
  },
  "why-hiring-sdrs-broken": {
    slug: "why-hiring-sdrs-broken",
    href: "/why-hiring-sdrs-broken",
    title: "Why Hiring SDRs Is Broken (And What Replaces Them)",
    category: "OPINION",
    readTime: "4 MIN READ",
    metaDescription: "The SDR tenure is shrinking while costs rise. It's time for a new model.",
    description: "The SDR tenure is shrinking while costs rise. It's time for a new model.",
    leadParagraphs: ["The average SDR tenure is now less than 15 months. By the time they are ramped, they leave. This cycle kills momentum.", "Axieonex provides a system, not a person, ensuring your pipeline generation never pauses due to turnover."],
    sections: [
    ],
  },
  "cold-outreach-to-revenue": {
    slug: "cold-outreach-to-revenue",
    href: "/cold-outreach-to-revenue",
    title: "From Cold Outreach to Revenue Systems: How Modern B2B Sales Actually Works",
    category: "SALES TACTICS",
    readTime: "5 MIN READ",
    metaDescription: "Moving beyond 'spray and pray' to orchestrated revenue engineering.",
    description: "Moving beyond 'spray and pray' to orchestrated revenue engineering.",
    leadParagraphs: ["Cold outreach isn't dead, but bad cold outreach is. Modern sales requires multi-channel orchestration—email, LinkedIn, and phone working in concert."],
    sections: [
    ],
  },
  "ai-sales-tools-fail": {
    slug: "ai-sales-tools-fail",
    href: "/ai-sales-tools-fail",
    title: "Why Most AI Sales Tools Fail Without Human Oversight",
    category: "TECHNOLOGY",
    readTime: "4 MIN READ",
    metaDescription: "Tools are only as good as the strategy behind them.",
    description: "Tools are only as good as the strategy behind them.",
    leadParagraphs: ["Buying a tool doesn't solve a sales problem. Without expert implementation and constant optimization, AI tools just generate noise at scale."],
    sections: [
    ],
  },
  "cost-inhouse-vs-outsourced": {
    slug: "cost-inhouse-vs-outsourced",
    href: "/cost-inhouse-vs-outsourced",
    title: "The True Cost of In-House Sales Teams vs. Outsourced AI-Driven Systems",
    category: "ROI",
    readTime: "6 MIN READ",
    metaDescription: "Calculating the hidden costs of management, software, and training.",
    description: "Calculating the hidden costs of management, software, and training.",
    leadParagraphs: ["When you factor in recruiting fees, management time, software licenses, and benefits, an in-house SDR team is significantly more expensive than an outcome-based AI system."],
    sections: [
    ],
  },
};

export const ARTICLES_ORDER = [
  "about-axon",
  "how-we-work",
  "why-hiring-sdrs-broken",
  "ai-vs-traditional-teams",
  "cold-outreach-to-revenue",
  "ai-sales-tools-fail",
  "ai-human-hybrid-model",
  "cost-inhouse-vs-outsourced",
] as const;
