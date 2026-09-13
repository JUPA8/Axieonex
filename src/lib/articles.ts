import { prisma } from "@/lib/prisma";
import type { Article as ArticleRecord } from "@prisma/client";
import type { Article } from "@/types/content";

/**
 * DB-backed Insights content (Phase 2). Replaces the old hardcoded
 * src/content/articles.ts placeholders, which are now only used by
 * prisma/seed.ts to migrate their approved copy into the database once.
 *
 * Public-facing reads only ever return `published` rows. Admin CRUD
 * (src/app/admin/(dashboard)/articles/) can see and edit drafts too.
 */

function toArticle(record: ArticleRecord): Article {
  return {
    slug: record.slug,
    title: record.title,
    category: record.category,
    color: record.color,
    intro: record.intro,
    h2a: record.h2a,
    bodyA: record.bodyA,
    h2b: record.h2b,
    bodyB: record.bodyB,
    closing: record.closing,
  };
}

export async function getPublishedArticles(): Promise<Article[]> {
  const records = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return records.map(toArticle);
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const record = await prisma.article.findFirst({ where: { slug, published: true } });
  return record ? toArticle(record) : null;
}

export async function getRelatedPublishedArticles(slug: string, count = 2): Promise<Article[]> {
  const records = await prisma.article.findMany({
    where: { published: true, slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: count,
  });
  return records.map(toArticle);
}
