"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ComparisonHubEntry } from "@/data/seo";

interface ComparisonHubClientProps {
  entries: ComparisonHubEntry[];
}

export function ComparisonHubClient({ entries }: ComparisonHubClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(entries.map((entry) => entry.category));
    return ["All", ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesCategory = activeCategory === "All" || entry.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.summary.toLowerCase().includes(q) ||
        entry.competitorName.toLowerCase().includes(q)
      );
    });
  }, [entries, query, activeCategory]);

  return (
    <div>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <label className="text-sm font-medium text-zinc-700">Search comparisons</label>
          <div className="mt-2 flex items-center rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by competitor, feature, or workflow"
              className="w-full bg-transparent text-sm text-zinc-700 outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">Showing {filtered.length} comparisons</p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">Filter by category</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/vs/${entry.slug}`}
              className="block h-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{entry.category}</p>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900">{entry.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{entry.summary}</p>
              <span className="mt-4 inline-flex text-sm font-medium text-zinc-500">Read comparison →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
