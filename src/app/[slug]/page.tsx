import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARTICLES_CONTENT } from "@/content/articles";
import { LEGAL_CONTENT } from "@/content/legal";
import { ArticleBody } from "@/features/articles/ArticleBody";
import { LegalBody } from "@/components/sections/LegalBody";
import { CtaSection } from "@/components/sections/CtaSection";
import { HOME_FINAL_CTA } from "@/content/homepage";

export function generateStaticParams() {
  const slugs = [...Object.keys(ARTICLES_CONTENT), ...Object.keys(LEGAL_CONTENT)];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES_CONTENT[slug];
  const legal = LEGAL_CONTENT[slug];
  if (article) {
    return {
      title: `${article.title} | Axieonex Blog`,
      description: article.metaDescription,
      alternates: { canonical: `/${slug}` },
    };
  }
  if (legal) {
    return {
      title: `${legal.title} | Axieonex Sales`,
      description: legal.metaDescription,
      alternates: { canonical: `/${slug}` },
    };
  }
  return {};
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES_CONTENT[slug];
  if (article) {
    return (
      <>
        <ArticleBody article={article} />
        <CtaSection
          heading={HOME_FINAL_CTA.heading}
          body={HOME_FINAL_CTA.body}
          primaryCta={HOME_FINAL_CTA.primaryCta}
          secondaryCta={HOME_FINAL_CTA.secondaryCta}
          secondaryHref={HOME_FINAL_CTA.secondaryHref}
        />
      </>
    );
  }

  const legal = LEGAL_CONTENT[slug];
  if (legal) {
    return <LegalBody legal={legal} />;
  }

  notFound();
}
