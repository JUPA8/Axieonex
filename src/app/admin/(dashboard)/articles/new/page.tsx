import type { Metadata } from "next";
import { ArticleForm } from "../ArticleForm";
import { createArticleAction } from "../actions";

export const metadata: Metadata = {
  title: "New Article | AXIEONEX Admin",
  robots: { index: false, follow: false },
};

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">New article</h1>
      <ArticleForm action={createArticleAction} submitLabel="Create article" />
    </div>
  );
}
