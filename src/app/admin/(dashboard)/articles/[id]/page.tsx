import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "../ArticleForm";
import { updateArticleAction } from "../actions";

export const metadata: Metadata = {
  title: "Edit Article | AXIEONEX Admin",
  robots: { index: false, follow: false },
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Edit article</h1>
      <ArticleForm action={updateArticleAction.bind(null, id)} initialValues={article} submitLabel="Save changes" />
    </div>
  );
}
