/**
 * Free text as of Phase 2 (admin-editable via /admin/articles), not a fixed
 * enum: the 4 categories below are the ones seeded from the originally
 * approved copy, not an exhaustive list an admin is limited to.
 */
export type ArticleCategory = "Operating model" | "Hiring" | "Strategy" | "Economics" | (string & {});

export type Article = {
  slug: string;
  title: string;
  category: ArticleCategory;
  color: string;
  intro: string;
  h2a: string;
  bodyA: string;
  h2b: string;
  bodyB: string;
  closing: string;
  /** ISO timestamp. Only present for DB-backed reads (src/lib/articles.ts); the
   *  historical seed literals in src/content/articles.ts don't carry one. */
  publishedAt?: string;
};

export type ServiceVisual = "radar" | "calendar" | "rings" | "envelope" | "network" | "waveform" | "blueprint";

export type ServiceStep = { n: string; text: string };

export type Service = {
  slug: string;
  title: string;
  role: string;
  accent: string;
  visual: ServiceVisual;
  purpose: string;
  problem: string;
  ai: string;
  human: string;
  control: string;
  receive: string;
  channels: string;
  quality: string;
  steps: ServiceStep[];
  faqQ: string;
  faqA: string;
  ecosystem: {
    label: string;
    tag: string;
    purpose: string;
    aiPerforms: string;
    humansPerform: string;
    youReceive: string;
    x: number;
    y: number;
    labelSide: "above" | "below" | "left" | "right";
  };
};

export type FaqItem = { question: string; answer: string };
