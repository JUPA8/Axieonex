"use client";

import { useMemo, useState } from "react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { cn } from "@/lib/cn";
import type { Article } from "@/types/content";

const ALL = "All";

export function InsightsInteractive({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  const categories = useMemo(() => [ALL, ...Array.from(new Set(articles.map((a) => a.category)))], [articles]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory = category === ALL || article.category === category;
      const matchesQuery = q.length === 0 || article.title.toLowerCase().includes(q) || article.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [articles, query, category]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-[320px]">
          <label htmlFor="insights-search" className="sr-only">
            Search articles
          </label>
          <input
            id="insights-search"
            type="search"
            placeholder="Search insights"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-11 w-full rounded-sm border border-ax-border-default bg-ax-surface-raised px-4 py-2.5 text-sm text-ax-text-primary placeholder:text-ax-text-muted focus:border-ax-violet"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                category === c
                  ? "border-ax-violet bg-ax-violet/15 text-ax-text-primary"
                  : "border-ax-border-default text-ax-text-muted hover:text-ax-text-primary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="mb-6 text-[13px] text-ax-text-muted">
        {results.length} {results.length === 1 ? "insight" : "insights"}
      </p>

      {results.length === 0 ? (
        <div className="border-t border-ax-border-subtle py-16 text-center">
          <h2 className="mb-2 text-lg font-bold">No insights match that search.</h2>
          <p className="text-sm text-ax-text-muted">Try a different term or clear the filters.</p>
        </div>
      ) : (
        <div className="grid gap-9" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {results.map((article) => (
            <TransitionLink
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="block border-t-2 pt-4.5"
              style={{ borderColor: article.color }}
            >
              <div className="text-[11px] font-semibold text-ax-text-muted">{article.category}</div>
              <div className="mt-2.5 text-lg font-semibold leading-snug">{article.title}</div>
            </TransitionLink>
          ))}
        </div>
      )}
    </div>
  );
}
