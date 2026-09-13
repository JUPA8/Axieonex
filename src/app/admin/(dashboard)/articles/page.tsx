import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteArticleAction, togglePublishAction } from "./actions";

export const metadata: Metadata = {
  title: "Articles | AXIEONEX Admin",
  robots: { index: false, follow: false },
};

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="min-h-11 rounded-sm bg-[image:var(--ax-gradient-spectral)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          New article
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-ax-border-subtle">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ax-border-subtle bg-white/[0.02]">
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ax-text-muted">
                  No articles yet.
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="border-b border-ax-border-subtle last:border-0">
                  <td className="px-4 py-3">{article.title}</td>
                  <td className="px-4 py-3 text-ax-text-muted">{article.slug}</td>
                  <td className="px-4 py-3">{article.category}</td>
                  <td className="px-4 py-3">{article.published ? "Published" : "Draft"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/admin/articles/${article.id}`} className="text-ax-cyan-alt hover:underline">
                        Edit
                      </Link>
                      <form action={togglePublishAction.bind(null, article.id)}>
                        <button type="submit" className="text-ax-text-primary hover:underline">
                          {article.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <form action={deleteArticleAction.bind(null, article.id)}>
                        <button type="submit" className="text-ax-error hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
