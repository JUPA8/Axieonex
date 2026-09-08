import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleTemplate } from "@/components/article/ArticleTemplate";
import { ARTICLES, getArticle } from "@/content/articles";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
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

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  return <ArticleTemplate article={article} />;
}
