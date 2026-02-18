"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";

type Job = {
  id: string;
  status: string;
  render_status: string | null;
  render_error: string | null;
  output_url: string | null;
  created_at: string;
};

export default function RenderQueuePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/caption?limit=200")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        const all = Array.isArray(d.jobs) ? d.jobs : [];
        const filtered = all.filter(
          (j: Job) => j.render_status === "queued" || j.render_status === "rendering"
        );
        setJobs(filtered);
      })
      .catch(() => setError("Failed to load render queue"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => !q || job.id.toLowerCase().includes(q));
  }, [jobs, query]);

  const queuedCount = jobs.filter((job) => job.render_status === "queued").length;
  const renderingCount = jobs.filter((job) => job.render_status === "rendering").length;

  return (
    <DashboardShell
      title="Render queue"
      subtitle="Monitor active renders and keep delivery on time."
      actions={
        <>
          <Link
            href="/dashboard/projects"
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
          >
            Projects
          </Link>
          <Link
            href="/dashboard/library"
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Clip library
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Queued", value: queuedCount },
          { label: "Rendering", value: renderingCount },
          { label: "Total in queue", value: jobs.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            type="search"
            placeholder="Search by project ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
          />
          <p className="text-xs text-zinc-500">{filtered.length} renders</p>
        </div>

        {loading && <p className="mt-6 text-sm text-zinc-600">Loading queue…</p>}
        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
            <p className="text-sm text-zinc-600">No queued renders right now.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="py-2 pr-4">Project</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-zinc-900">Project {job.id.slice(0, 8)}</p>
                      <p className="text-xs text-zinc-500">{job.id}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                          job.render_status === "rendering"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {job.render_status ?? "queued"}
                      </span>
                      {job.render_error && (
                        <p className="mt-1 text-xs text-rose-600">{job.render_error}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-zinc-600">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/dashboard/projects/${job.id}`}
                          className="touch-target inline-flex min-h-[36px] items-center rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
                        >
                          View
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
