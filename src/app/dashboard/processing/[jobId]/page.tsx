"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";

interface JobStatus {
  jobId: string;
  status: string;
  renderStatus?: string;
  renderError?: string;
  outputUrl?: string;
  createdAt?: string;
  options?: { notifyEmail?: string | null; notifyOnComplete?: boolean };
}

export default function ProcessingPage({ params }: { params: { jobId: string } }) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const res = await fetch(`/api/caption/${params.jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to fetch status");
        if (mounted) {
          setJob(data);
          if (data.options?.notifyOnComplete) {
            setNotifyEnabled(true);
            setNotifyEmail(data.options?.notifyEmail ?? "");
          }
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed");
      }
    }
    poll();
    const interval = setInterval(poll, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [params.jobId]);

  const steps = {
    upload: true,
    transcribe: job?.status === "transcribing" || job?.status === "pending" || job?.status === "completed",
    analyze: job?.status === "pending" || job?.status === "completed",
    ready: job?.status === "pending" || job?.status === "completed",
  };

  async function saveNotifyPreference(nextEnabled: boolean, email: string) {
    setNotifyStatus("Saving notification preference...");
    try {
      const res = await fetch(`/api/caption/${params.jobId}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setNotifyStatus(nextEnabled ? "We’ll email you when it’s ready." : "Notifications turned off.");
    } catch (e) {
      setNotifyStatus(e instanceof Error ? e.message : "Failed to save");
    }
  }

  return (
    <DashboardShell
      title="Processing"
      subtitle="Transcribing your video and generating clip suggestions."
      actions={
        job?.jobId ? (
          <Link
            href={`/dashboard/projects/${job.jobId}`}
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            View project
          </Link>
        ) : (
          <Link
            href="/dashboard/projects"
            className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
          >
            Projects
          </Link>
        )
      }
    >
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Pipeline</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Upload", done: steps.upload },
              { label: "Transcribe", done: steps.transcribe },
              { label: "Analyze", done: steps.analyze },
              { label: "Ready", done: steps.ready },
            ].map((step) => (
              <div
                key={step.label}
                className={`rounded-xl border px-3 py-3 text-sm ${
                  step.done
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 text-zinc-500"
                }`}
              >
                {step.label}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-[var(--muted-bg)] p-4">
            <p className="text-sm text-zinc-700">
              Estimated time: 2–4 minutes for most uploads.
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Longer videos may take more time. You can leave this page and come back later.
            </p>
          </div>

          {job?.status === "pending" && (
            <div className="mt-6">
              <Link
                href={`/dashboard/editor/${params.jobId}`}
                className="touch-target inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
              >
                Open editor
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-900">Notify me when ready</p>
              <p className="mt-1 text-xs text-zinc-500">We’ll email you once the project is ready.</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={notifyEnabled}
                onChange={(e) => {
                  const next = e.target.checked;
                  setNotifyEnabled(next);
                  if (!next) {
                    saveNotifyPreference(false, "");
                  }
                }}
                className="rounded border-zinc-300"
              />
              Enable
            </label>
          </div>
          {notifyEnabled && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="email"
                placeholder="you@company.com"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
              />
              <button
                type="button"
                onClick={() => saveNotifyPreference(true, notifyEmail.trim())}
                className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          )}
          {notifyStatus && <p className="mt-2 text-xs text-zinc-500">{notifyStatus}</p>}
        </div>
      </div>
    </DashboardShell>
  );
}
