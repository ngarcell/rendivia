"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { TimelineClip } from "@/lib/caption-edits";
import DashboardShell from "@/components/dashboard/DashboardShell";

interface JobDetail {
  jobId: string;
  status: string;
  outputUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  renderStatus?: string;
  renderError?: string;
  aspectRatio?: string;
  edits?: { captions?: unknown[]; timeline?: TimelineClip[] };
  suggestedCuts?: { silentParts?: { start: number; end: number }[] };
}

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function stepStatus(job: JobDetail) {
  return {
    upload: true,
    transcribe: job.status !== "pending" && job.status !== "failed",
    analyze: Boolean(job.suggestedCuts?.silentParts?.length),
    ready: job.status === "pending" || job.status === "completed" || Boolean(job.edits),
  };
}

export default function ProjectDetailPage({ params }: { params: { jobId: string } }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [usage, setUsage] = useState<{ features?: Record<string, boolean>; renderingEnabled?: boolean } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/caption/${params.jobId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setJob(data);
        setError("");
      })
      .catch(() => setError("Failed to load project"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [params.jobId]);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!job?.renderStatus) return;
    if (job.renderStatus !== "queued" && job.renderStatus !== "rendering") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/caption/${params.jobId}`);
      const data = await res.json();
      setJob((prev) => ({ ...(prev ?? {}), ...data }));
      if (data.outputUrl || data.renderStatus === "failed") clearInterval(interval);
    }, 5000);
    return () => clearInterval(interval);
  }, [job?.renderStatus, params.jobId]);

  const steps = useMemo(() => (job ? stepStatus(job) : null), [job]);
  const clipCount = job?.edits?.timeline?.length ?? 0;
  const captionCount = job?.edits?.captions?.length ?? 0;

  async function handleSuggestCuts() {
    setStatus("Analyzing silence...");
    try {
      const res = await fetch(`/api/caption/${params.jobId}/suggest-cuts`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to analyze");
      setJob((prev) => (prev ? { ...prev, suggestedCuts: data.suggestedCuts } : prev));
      setStatus("Suggestions ready.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to analyze");
    }
  }

  async function handleRender() {
    setStatus("Queuing render...");
    try {
      const res = await fetch(`/api/caption/${params.jobId}/render`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Render failed");
      setStatus("Render queued. This can take a few minutes.");
      setJob((prev) => (prev ? { ...prev, renderStatus: "queued" } : prev));
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Render failed");
    }
  }

  if (loading) {
    return (
      <DashboardShell title="Project" subtitle="Loading project details...">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">Loading project…</div>
      </DashboardShell>
    );
  }

  if (error || !job) {
    return (
      <DashboardShell title="Project" subtitle="Unable to load project">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error || "Project not found"}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={`Project ${job.jobId.slice(0, 8)}`}
      subtitle={job.createdAt ? `Created ${new Date(job.createdAt).toLocaleString()}` : "Project overview"}
      actions={
        <>
          {usage?.features?.captionEditor && (
            <Link
              href={`/dashboard/editor/${params.jobId}`}
              className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Open editor
            </Link>
          )}
          <button
            type="button"
            onClick={handleSuggestCuts}
            disabled={!usage?.features?.captionEditor}
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 disabled:opacity-50"
          >
            Regenerate suggestions
          </button>
          <button
            type="button"
            onClick={handleRender}
            disabled={!usage?.features?.lambdaRender || usage?.renderingEnabled === false}
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 disabled:opacity-50"
          >
            Render
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Status</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {steps && (
              <>
                <div className={`rounded-lg border px-3 py-2 text-xs ${steps.upload ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-500"}`}>Upload</div>
                <div className={`rounded-lg border px-3 py-2 text-xs ${steps.transcribe ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-500"}`}>Transcribe</div>
                <div className={`rounded-lg border px-3 py-2 text-xs ${steps.analyze ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-500"}`}>Analyze</div>
                <div className={`rounded-lg border px-3 py-2 text-xs ${steps.ready ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-500"}`}>Ready</div>
              </>
            )}
          </div>
          {job.renderError && <p className="mt-2 text-sm text-red-600">{job.renderError}</p>}
          {status && <p className="mt-2 text-sm text-zinc-600">{status}</p>}
          {usage?.renderingEnabled === false && (
            <p className="mt-2 text-sm text-amber-600">
              Rendering is disabled until a Remotion Company License is active.
            </p>
          )}

          {job.videoUrl && (
            <div className="mt-6">
              <p className="text-sm font-medium text-zinc-700">Source video</p>
              <video className="mt-2 w-full rounded-lg border border-zinc-200" src={job.videoUrl} controls />
            </div>
          )}

          {job.outputUrl && (
            <div className="mt-6">
              <p className="text-sm font-medium text-zinc-700">Latest render</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a
                  href={job.outputUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target inline-flex min-h-[40px] items-center text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Download rendered MP4
                </a>
                <span className="text-xs text-zinc-500">{job.renderStatus ?? "completed"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Project summary</h2>
            <div className="mt-3 grid gap-2 text-sm text-zinc-600">
              <div>Clips: {clipCount}</div>
              <div>Captions: {captionCount}</div>
              <div>Aspect ratio: {job.aspectRatio ?? "9:16"}</div>
              <div>Render status: {job.renderStatus ?? "idle"}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Suggested cuts</h2>
            {job.suggestedCuts?.silentParts?.length ? (
              <div className="mt-3 space-y-2 text-sm text-zinc-600">
                {job.suggestedCuts.silentParts.slice(0, 12).map((part, idx) => (
                  <div key={`${part.start}-${idx}`} className="flex justify-between">
                    <span>Cut {idx + 1}</span>
                    <span>{formatSeconds(part.start)} – {formatSeconds(part.end)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">No suggestions yet. Run analysis to see cut points.</p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Clip list</h2>
            {job.edits?.timeline?.length ? (
              <div className="mt-3 space-y-2 text-sm text-zinc-600">
                {job.edits.timeline.map((clip, idx) => {
                  const length = Math.max(0, (clip.end ?? 0) - (clip.start ?? 0));
                  return (
                    <div key={clip.id ?? idx} className="flex justify-between">
                      <span>Clip {idx + 1}</span>
                      <span>
                        {formatSeconds(clip.start ?? 0)} – {formatSeconds(clip.end ?? 0)} ({length.toFixed(1)}s)
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">No clips defined yet. Open the editor to create clips.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
