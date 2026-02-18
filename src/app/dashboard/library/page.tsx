"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";

type Job = {
  id: string;
  output_url: string | null;
  created_at: string;
  aspect_ratio: string | null;
};

export default function ClipLibraryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let mounted = true;
    fetch("/api/caption?output=1&limit=200")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setJobs(Array.isArray(d.jobs) ? d.jobs : []);
      })
      .catch(() => setError("Failed to load clip library"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const byAspect = filter === "all" ? jobs : jobs.filter((j) => (j.aspect_ratio ?? "9:16") === filter);
    const q = query.trim().toLowerCase();
    if (!q) return byAspect;
    return byAspect.filter((j) => j.id.toLowerCase().includes(q));
  }, [jobs, filter, query]);

  return (
    <DashboardShell
      title="Clip library"
      subtitle="Delivered exports ready for download or team sharing."
      actions={
        <>
          <Link
            href="/dashboard/projects"
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
          >
            Projects
          </Link>
          <Link
            href="/dashboard/queue"
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Render queue
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Rendered clips", value: jobs.length },
          { label: "9:16 exports", value: jobs.filter((j) => (j.aspect_ratio ?? "9:16") === "9:16").length },
          { label: "Last 7 days", value: jobs.filter((j) => now - new Date(j.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Search by clip ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-56 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
            >
              <option value="all">All ratios</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
            </select>
          </div>
          <p className="text-xs text-zinc-500">{filtered.length} clips</p>
        </div>

        {loading && <p className="mt-6 text-sm text-zinc-600">Loading clips…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
            <p className="text-sm text-zinc-600">No rendered clips yet.</p>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <div key={job.id} className="rounded-2xl border border-zinc-200 p-4 shadow-sm">
              <p className="text-xs text-zinc-500">{new Date(job.created_at).toLocaleString()}</p>
              <p className="mt-1 text-sm font-medium text-zinc-900">Clip {job.id.slice(0, 8)}</p>
              <p className="mt-1 text-xs text-zinc-500">Aspect {job.aspect_ratio ?? "9:16"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/projects/${job.id}`}
                  className="touch-target inline-flex min-h-[36px] items-center rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
                >
                  View project
                </Link>
                {job.output_url && (
                  <a
                    href={job.output_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target inline-flex min-h-[36px] items-center rounded-lg bg-[var(--accent)] px-3 text-xs font-semibold text-white hover:bg-[var(--accent-hover)]"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
