import { Container } from "@/components/ui/Container";
import { SectionHeading, Lede } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { ArticleCard } from "@/features/articles/ArticleCard";
import { ARTICLES_CONTENT } from "@/content/articles";
import { HOME_ARTICLES_SECTION } from "@/content/homepage";

export function ArticlesPreview() {
  const articles = HOME_ARTICLES_SECTION.featuredSlugs.map((slug) => ARTICLES_CONTENT[slug]);

  return (
    <section className="border-b border-[var(--color-border)] py-20 sm:py-28">
      <Container className="max-w-3xl text-center">
        <SectionHeading>{HOME_ARTICLES_SECTION.heading}</SectionHeading>
        <Lede className="mx-auto mt-4">{HOME_ARTICLES_SECTION.intro}</Lede>
      </Container>
      <Container className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </Container>
      <Container className="mt-10 text-center">
        <Button href="/articles" variant="outline">
          View All Articles
        </Button>
      </Container>
    </section>
  );
}
