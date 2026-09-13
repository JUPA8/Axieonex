import type { Article } from "@/types/content";

/**
 * Historical source data only, as of Backend Phase 2. The live site now
 * reads articles from Postgres (src/lib/articles.ts) so they're editable
 * from /admin without a redeploy; this array is kept solely as the input
 * for prisma/seed.ts, which copied it into the database once. Editing this
 * file no longer changes anything on the live site.
 *
 * Canonical article slugs come from axieonex-routes.json (the routing authority).
 * The prototype's Insights/Article `.dc.html` files use a different, mutually
 * inconsistent slug set (e.g. "modern-b2b-revenue-systems" instead of
 * "cold-outreach-to-revenue-systems"), a documented drift between the static
 * preview and the approved route manifest. Titles/body copy below are ported
 * verbatim from the prototype's data object; only the slugs are normalized to
 * the manifest's canonical values. No article has full long-form body copy yet
 * (only title + a 4-paragraph seed, per the handoff's own disclosure), and this is
 * surfaced honestly rather than padded with invented copy.
 */
export const ARTICLES: Article[] = [
  {
    slug: "ai-human-hybrid-revenue-systems",
    title: "How We Use an AI and Human Hybrid Model to Build Predictable Revenue",
    category: "Operating model",
    color: "#3E7BFA",
    intro:
      "Predictable pipeline does not come from AI alone, and it does not come from headcount alone. It comes from a system where each does the part it is actually good at.",
    h2a: "Where AI adds real leverage",
    bodyA:
      "AI is best at continuous, tireless work: scanning market signals, scoring accounts, sequencing outreach, and surfacing the accounts worth a human conversation.",
    h2b: "Where human judgment is irreplaceable",
    bodyB:
      "Tone, timing, objection handling and the read on whether a prospect is genuinely ready to buy still require an experienced person. Removing that layer is where most automated outreach fails.",
    closing:
      "Axieonex is built around this division of labor: AI for volume and pattern-matching, humans for judgment and conversation.",
  },
  {
    slug: "ai-sales-systems-vs-traditional-teams",
    title: "AI-Powered Sales Systems vs. Traditional Human Teams",
    category: "Operating model",
    color: "#3E7BFA",
    intro:
      'The choice is rarely as binary as "AI or people." The more useful question is which parts of outbound each should own.',
    h2a: "What traditional SDR teams do well",
    bodyA:
      "A well-trained SDR team brings judgment, relationship-building and adaptability that generic automation cannot replicate on its own.",
    h2b: "What breaks at scale",
    bodyB:
      "Traditional teams struggle to keep pace with the volume of signal available today, and quality becomes inconsistent as headcount grows.",
    closing: "A coordinated AI and human system keeps the judgment while removing the volume ceiling.",
  },
  {
    slug: "why-internal-sdr-hiring-is-broken",
    title: "Why Hiring SDRs Is Broken",
    category: "Hiring",
    color: "#E94FA8",
    intro:
      "Building an internal SDR function usually means months of hiring and ramp before the first reliable pipeline appears.",
    h2a: "The hidden cost of ramp time",
    bodyA:
      "Recruiting, training and management overhead all land before any revenue does, and turnover often resets that clock.",
    h2b: "What replaces it",
    bodyB:
      "A system that is already operating, with signal detection, sequencing and qualification built in, removes the ramp-time problem entirely.",
    closing:
      "The question is not whether to invest in outbound. It is whether to rebuild the machinery from scratch or plug into one that already runs.",
  },
  {
    slug: "cold-outreach-to-revenue-systems",
    title: "From Cold Outreach to Revenue Systems",
    category: "Strategy",
    color: "#35D3E0",
    intro:
      "Cold outreach as a standalone tactic is losing effectiveness. What works now is outreach embedded in a larger, coordinated system.",
    h2a: "From channel to system",
    bodyA:
      "Email, LinkedIn and calling perform better together, sequenced with shared context, than they do run independently.",
    h2b: "Signal changes everything",
    bodyB:
      "Reaching out because of a real trigger, funding, hiring, technology change, converts differently than reaching out cold.",
    closing: "A modern revenue system treats every channel as one coordinated motion rather than a separate campaign.",
  },
  {
    slug: "why-ai-sales-tools-fail",
    title: "Why Most AI Sales Tools Fail Without Human Oversight",
    category: "Operating model",
    color: "#3E7BFA",
    intro:
      "Unsupervised AI outreach tends to degrade quickly: messaging becomes generic, timing becomes mechanical, and prospects notice.",
    h2a: "Where automation drifts",
    bodyA:
      "Without a human reviewing tone and cadence, AI-generated sequences drift toward the lowest common denominator of messaging.",
    h2b: "The role of supervision",
    bodyB: "A strategist reviewing quality and a rep handling every real reply keeps the system credible in front of prospects.",
    closing: "AI without oversight optimizes for volume. AI with oversight optimizes for quality and volume together.",
  },
  {
    slug: "in-house-vs-outsourced-revenue-systems",
    title: "The True Cost of In-House Sales Teams vs. Outsourced AI-Driven Systems",
    category: "Economics",
    color: "#8B5CF6",
    intro:
      "Comparing costs fairly means counting more than salary: recruiting, tooling, management time and ramp all belong in the equation.",
    h2a: "What an internal build actually costs",
    bodyA: "Beyond compensation, an internal team requires tooling, management overhead and time before it becomes productive.",
    h2b: "What changes with an outsourced system",
    bodyB: "A running system removes the ramp period and the tooling overhead, replacing it with one accountable engagement.",
    closing:
      "We do not publish comparative figures here. Bring your current numbers to a strategy call and we will map the real difference for your business.",
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function getRelatedArticles(slug: string, count = 2): Article[] {
  return ARTICLES.filter((article) => article.slug !== slug).slice(0, count);
}
