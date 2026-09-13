"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type ArticleFormState = { error?: string };

const REQUIRED_FIELDS = ["slug", "title", "category", "color", "intro", "h2a", "bodyA", "h2b", "bodyB", "closing"] as const;

function readFields(formData: FormData) {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    values[field] = String(formData.get(field) ?? "").trim();
  }
  return values as Record<(typeof REQUIRED_FIELDS)[number], string>;
}

function validate(values: Record<string, string>): string | null {
  for (const field of REQUIRED_FIELDS) {
    if (!values[field]) return `Please fill in "${field}".`;
  }
  if (!/^[a-z0-9-]+$/.test(values.slug)) {
    return "Slug must be lowercase letters, numbers, and hyphens only.";
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(values.color)) {
    return "Color must be a hex value like #3E7BFA.";
  }
  return null;
}

function revalidateArticleRoutes(slug?: string) {
  revalidatePath("/insights");
  revalidatePath("/");
  revalidatePath("/admin/articles");
  if (slug) revalidatePath(`/insights/${slug}`);
}

export async function createArticleAction(_prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const values = readFields(formData);
  const error = validate(values);
  if (error) return { error };

  const published = formData.get("published") === "on";

  try {
    await prisma.article.create({
      data: { ...values, published, publishedAt: published ? new Date() : null },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { error: "An article with that slug already exists." };
    }
    console.error("[admin/articles] Failed to create article:", err);
    return { error: "Something went wrong saving the article. Please try again." };
  }

  revalidateArticleRoutes(values.slug);
  redirect("/admin/articles");
}

export async function updateArticleAction(id: string, _prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const values = readFields(formData);
  const error = validate(values);
  if (error) return { error };

  const published = formData.get("published") === "on";

  try {
    const existing = await prisma.article.findUnique({ where: { id } });
    await prisma.article.update({
      where: { id },
      data: {
        ...values,
        published,
        publishedAt: published ? (existing?.publishedAt ?? new Date()) : null,
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { error: "An article with that slug already exists." };
    }
    console.error("[admin/articles] Failed to update article:", err);
    return { error: "Something went wrong saving the article. Please try again." };
  }

  revalidateArticleRoutes(values.slug);
  redirect("/admin/articles");
}

export async function deleteArticleAction(id: string) {
  const article = await prisma.article.delete({ where: { id } });
  revalidateArticleRoutes(article.slug);
}

export async function togglePublishAction(id: string) {
  const article = await prisma.article.findUniqueOrThrow({ where: { id } });
  const published = !article.published;
  await prisma.article.update({
    where: { id },
    data: { published, publishedAt: published ? (article.publishedAt ?? new Date()) : article.publishedAt },
  });
  revalidateArticleRoutes(article.slug);
}
