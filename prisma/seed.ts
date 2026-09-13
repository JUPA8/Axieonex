/**
 * One-time migration: copies the 6 canonical articles that used to live as
 * hardcoded placeholders in src/content/articles.ts into the database, as
 * published rows, so switching the Insights routes to read from Postgres
 * doesn't empty the site out. Safe to re-run (upserts by slug).
 *
 *   pnpm db:seed
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { ARTICLES } from "../src/content/articles";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });
  try {
    for (const article of ARTICLES) {
      await prisma.article.upsert({
        where: { slug: article.slug },
        update: {
          title: article.title,
          category: article.category,
          color: article.color,
          intro: article.intro,
          h2a: article.h2a,
          bodyA: article.bodyA,
          h2b: article.h2b,
          bodyB: article.bodyB,
          closing: article.closing,
          published: true,
          publishedAt: new Date(),
        },
        create: {
          slug: article.slug,
          title: article.title,
          category: article.category,
          color: article.color,
          intro: article.intro,
          h2a: article.h2a,
          bodyA: article.bodyA,
          h2b: article.h2b,
          bodyB: article.bodyB,
          closing: article.closing,
          published: true,
          publishedAt: new Date(),
        },
      });
      console.log(`Seeded: ${article.slug}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
