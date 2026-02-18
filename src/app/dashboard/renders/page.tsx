"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/dashboard/SidebarLayout";
import CodeBlock from "@/components/CodeBlock";

type RenderJob = {
  id: string;
  template_id: string;
  template_version: string;
  status: string;
  output_url: string | null;
  render_error: string | null;
  webhook_status: string | null;
  webhook_error: string | null;
  input_data: unknown;
  duration_seconds: number | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = ["all", "queued", "rendering", "completed", "failed"] as const;

const STATUS_STYLES: Record<string, string> = {
  queued: "border-amber-200 bg-amber-50 text-amber-700",
  rendering: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function RendersPage() {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/render-jobs?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        const rows = Array.isArray(d.jobs) ? d.jobs : [];
        setJobs(rows);
        setSelectedId(rows[0]?.id ?? null);
      })
      .catch(() => setError("Failed to load render jobs"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (!query.trim()) return true;
      const target = `${job.id} ${job.template_id} ${job.template_version}`.toLowerCase();
      return target.includes(query.toLowerCase());
    });
  }, [jobs, statusFilter, query]);

  const selectedJob = filtered.find((job) => job.id === selectedId) ?? filtered[0];

  async function handleRetry(jobId: string) {
    const res = await fetch(`/api/render-jobs/${jobId}/retry`, { method: "POST" });
    if (res.ok) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: "queued", render_error: null, output_url: null }
            : job
        )
      );
    }
  }

  return (
    <SidebarLayout title="Renders" subtitle="Monitor render jobs, status, and output delivery.">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as (typeof STATUS_OPTIONS)[number])}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All statuses" : status}
                  </option>
                ))}
              </select>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="Search by job or template"
              />
            </div>
            {loading && <span className="text-xs text-zinc-500">Loading...</span>}
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          {!loading && filtered.length === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600">
              No render jobs match those filters.
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    className={`cursor-pointer border-t border-zinc-200 hover:bg-zinc-50 ${
                      selectedJob?.id === job.id ? "bg-[var(--accent-light)]" : ""
                    }`}
                    onClick={() => setSelectedId(job.id)}
                  >
                    <td className="px-4 py-3 text-xs text-zinc-600">{job.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-800">
                      {job.template_id} - {job.template_version}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                          STATUS_STYLES[job.status] ?? "border-zinc-200 bg-zinc-50 text-zinc-600"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {selectedJob ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Render detail</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {selectedJob.template_id} - {selectedJob.template_version}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Job {selectedJob.id}</p>
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                    STATUS_STYLES[selectedJob.status] ?? "border-zinc-200 bg-zinc-50 text-zinc-600"
                  }`}
                >
                  {selectedJob.status}
                </span>
                <button
                  onClick={() => handleRetry(selectedJob.id)}
                  className="touch-target inline-flex min-h-[40px] items-center justify-center rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
                >
                  Retry render
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                {selectedJob.duration_seconds && (
                  <span>Duration {selectedJob.duration_seconds}s</span>
                )}
                {selectedJob.resolution && <span>Resolution {selectedJob.resolution}</span>}
              </div>

              {selectedJob.output_url && (
                <a
                  href={selectedJob.output_url}
                  className="mt-4 inline-flex text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  Download MP4
                </a>
              )}

              {selectedJob.render_error && (
                <p className="mt-3 text-xs text-rose-600">{selectedJob.render_error}</p>
              )}

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Input JSON</p>
                <div className="mt-2">
                  <CodeBlock code={JSON.stringify(selectedJob.input_data ?? {}, null, 2)} />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-zinc-200 bg-[var(--muted-bg)] p-3 text-xs text-zinc-600">
                <p className="font-semibold text-zinc-700">Webhook status</p>
                <p className="mt-1">
                  {selectedJob.webhook_status ?? "Not sent"}
                  {selectedJob.webhook_error ? ` - ${selectedJob.webhook_error}` : ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              Select a render to view details.
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
