"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/dashboard/SidebarLayout";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import CodeBlock from "@/components/CodeBlock";

type RenderJob = {
  id: string;
  template_id: string;
  template_version: string;
  status: string;
  output_url: string | null;
  created_at: string;
  updated_at: string;
};

type UsageRes = {
  planName: string;
  usage?: { rendersCount: number };
};

const EMPTY_RENDER_SNIPPET = `POST /api/v1/render
{
  "template": "weekly-summary-v1",
  "data": {
    "title": "Weekly Summary",
    "metrics": [
      { "label": "Revenue", "value": 12450 },
      { "label": "Users", "value": 342 }
    ]
  },
  "brand": "acme"
}`;

const STATUS_STYLES: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700 border border-slate-200",
  rendering: "bg-amber-100 text-amber-700 border border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  failed: "bg-rose-100 text-rose-700 border border-rose-200",
  error: "bg-rose-100 text-rose-700 border border-rose-200",
};

export default function DashboardOverview() {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [usage, setUsage] = useState<UsageRes | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);

  const loadJobs = useCallback(() => {
    fetch("/api/render-jobs?limit=50")
      .then((r) => r.json())
      .then((d) => setJobs(Array.isArray(d.jobs) ? d.jobs : []))
      .catch(() => setJobs([]));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d && d.usage ? d : null))
      .catch(() => setUsage(null));
  }, []);

  const retryJob = useCallback(
    async (jobId: string) => {
      try {
        setRetryError(null);
        setRetryingId(jobId);
        await fetch(`/api/render-jobs/${jobId}/retry`, { method: "POST" });
        await loadJobs();
      } catch (error) {
        setRetryError(error instanceof Error ? error.message : "Failed to retry render");
      } finally {
        setRetryingId(null);
      }
    },
    [loadJobs]
  );

  const stats = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter((job) => job.status === "completed");
    const successRate = total ? Math.round((completed.length / total) * 100) : 0;
    const avgMs = completed.length
      ? completed.reduce((sum, job) => {
          const created = new Date(job.created_at).getTime();
          const updated = new Date(job.updated_at).getTime();
          return sum + Math.max(0, updated - created);
        }, 0) / completed.length
      : 0;
    const avgMinutes = avgMs ? Math.max(1, Math.round(avgMs / 60000)) : 0;
    return {
      rendersThisMonth: usage?.usage?.rendersCount ?? total,
      avgRenderTime: avgMinutes ? `${avgMinutes}m` : "-",
      successRate: total ? `${successRate}%` : "-",
    };
  }, [jobs, usage]);

  const rows = jobs.slice(0, 8).map((job) => {
    const statusTone = STATUS_STYLES[job.status] ?? "bg-slate-100 text-slate-700 border border-slate-200";
    const canRetry = ["failed", "error"].includes(job.status);
    return {
      id: job.id.slice(0, 8),
      template: `${job.template_id} - ${job.template_version}`,
      status: (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
          {job.status}
        </span>
      ),
      created: new Date(job.created_at).toLocaleDateString(),
      output: job.output_url ? (
        <a
          href={job.output_url}
          className="text-xs font-semibold text-[var(--accent)] hover:underline"
        >
          MP4
        </a>
      ) : (
        <span className="text-xs text-zinc-400">-</span>
      ),
      actions: canRetry ? (
        <button
          type="button"
          onClick={() => retryJob(job.id)}
          disabled={retryingId === job.id}
          className="text-xs font-semibold text-[var(--accent)] hover:underline disabled:cursor-not-allowed disabled:text-zinc-400"
        >
          {retryingId === job.id ? "Retrying…" : "Retry"}
        </button>
      ) : (
        <span className="text-xs text-zinc-400">-</span>
      ),
    };
  });

  return (
    <SidebarLayout title="Overview" subtitle="Your programmatic video activity at a glance.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Renders this month" value={String(stats.rendersThisMonth)} />
        <StatCard label="Avg render time" value={stats.avgRenderTime} helper="Based on recent completed jobs" />
        <StatCard label="Success rate" value={stats.successRate} helper="Completed / total" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Recent renders</h2>
        {retryError ? (
          <p className="mt-2 text-xs font-semibold text-rose-600">{retryError}</p>
        ) : null}
        <div className="mt-4">
          <DataTable
            columns={[
              { key: "id", label: "Job" },
              { key: "template", label: "Template" },
              { key: "status", label: "Status" },
              { key: "created", label: "Created" },
              { key: "output", label: "Output" },
              { key: "actions", label: "Actions" },
            ]}
            rows={rows}
            empty="No render jobs yet."
          />
        </div>
        {jobs.length === 0 ? (
          <div className="mt-6 grid gap-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Queue your first render</p>
              <p className="mt-1 text-xs text-zinc-500">
                Send JSON to <span className="font-semibold text-zinc-700">/api/v1/render</span> to start.
              </p>
            </div>
            <CodeBlock title="Example request" code={EMPTY_RENDER_SNIPPET} />
          </div>
        ) : null}
      </div>
    </SidebarLayout>
  );
}
