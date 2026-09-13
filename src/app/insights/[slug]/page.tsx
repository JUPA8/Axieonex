import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleTemplate } from "@/components/article/ArticleTemplate";
import { getPublishedArticleBySlug } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";

// Content is admin-editable (Phase 2), so this route reads Postgres on every
// request rather than freezing at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug).catch(() => null);
  if (!article) return {};
  const canonical = `${SITE_URL}/insights/${slug}`;
  const title = `${article.title} | AXIEONEX Insights`;
  return {
    title,
    description: article.intro,
    alternates: { canonical },
    openGraph: { title, description: article.intro, url: canonical, type: "article" },
  };
}

// TODO(seo): Article JSON-LD schema is intentionally not emitted here. The
// Article model has publishedAt, but no author field exists anywhere in the
// schema, admin CRUD form, or rendered article template. Inventing an author
// value isn't acceptable, so this is blocked on an owner decision: either
// add a real author field (e.g. "Axieonex Editorial Team" as an
// Organization-type author) or confirm the site intentionally publishes
// unattributed articles.
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug).catch((error) => {
    console.error("[insights/slug] Failed to load article from the database:", error);
    return null;
  });
  if (!article) notFound();
  return <ArticleTemplate article={article} />;
}
