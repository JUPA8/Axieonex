import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleTemplate } from "@/components/article/ArticleTemplate";
import { getPublishedArticleBySlug } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";
import { buildArticleSchema } from "@/lib/structuredData";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPublicMetadata } from "@/lib/metadata";

// Content is admin-editable (Phase 2), so this route reads Postgres on every
// request rather than freezing at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug).catch(() => null);
  if (!article) return { robots: { index: false, follow: false } };
  const canonical = `${SITE_URL}/insights/${slug}`;
  const title = `${article.title} | AXIEONEX Insights`;
  return buildPublicMetadata({
    title,
    description: article.intro,
    canonical,
    type: "article",
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug).catch(() => {
    console.error("[insights/slug] Failed to load article from the database.");
    return null;
  });
  if (!article) notFound();
  const schema = buildArticleSchema(article, `${SITE_URL}/insights/${slug}`);
  return (
    <>
      {schema && <JsonLd data={schema} />}
      <ArticleTemplate article={article} />
    </>
  );
}
