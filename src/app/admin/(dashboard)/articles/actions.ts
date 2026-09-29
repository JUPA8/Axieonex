"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuthorization";
import { prisma } from "@/lib/prisma";
import { isSafeRecordId, parseArticleForm } from "@/lib/serverValidation";

export type ArticleFormState = { error?: string };

function revalidateArticleRoutes(slug?: string) {
  revalidatePath("/insights");
  revalidatePath("/");
  revalidatePath("/admin/articles");
  if (slug) revalidatePath(`/insights/${slug}`);
}

export async function createArticleAction(_prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();
  const parsed = parseArticleForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { published, ...values } = parsed.data;

  try {
    await prisma.article.create({
      data: { ...values, published, publishedAt: published ? new Date() : null },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { error: "An article with that slug already exists." };
    }
    console.error("[admin/articles] Failed to create article.");
    return { error: "Something went wrong saving the article. Please try again." };
  }

  revalidateArticleRoutes(values.slug);
  redirect("/admin/articles");
}

export async function updateArticleAction(id: string, _prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  await requireAdmin();
  if (!isSafeRecordId(id)) return { error: "Invalid article request." };
  const parsed = parseArticleForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { published, ...values } = parsed.data;

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
    console.error("[admin/articles] Failed to update article.");
    return { error: "Something went wrong saving the article. Please try again." };
  }

  revalidateArticleRoutes(values.slug);
  redirect("/admin/articles");
}

export async function deleteArticleAction(id: string) {
  await requireAdmin();
  if (!isSafeRecordId(id)) throw new Error("Invalid article request.");
  const article = await prisma.article.delete({ where: { id } });
  revalidateArticleRoutes(article.slug);
}

export async function togglePublishAction(id: string) {
  await requireAdmin();
  if (!isSafeRecordId(id)) throw new Error("Invalid article request.");
  const article = await prisma.article.findUniqueOrThrow({ where: { id } });
  const published = !article.published;
  await prisma.article.update({
    where: { id },
    data: { published, publishedAt: published ? (article.publishedAt ?? new Date()) : article.publishedAt },
  });
  revalidateArticleRoutes(article.slug);
}
