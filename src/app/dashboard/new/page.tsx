"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";

type UsageRes = {
  planId: string;
  planName: string;
  limits: { videosPerMonth: number; apiCallsPerMonth: number };
  usage: { videosCount: number; rendersCount: number; apiCallsCount: number };
  features: Record<string, boolean>;
  remotionLicensed?: boolean;
  renderingEnabled?: boolean;
};

export default function NewProjectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<{
    jobId?: string;
    videoUrl?: string;
    wordCount?: number;
    outputUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);
  const [usage, setUsage] = useState<UsageRes | null>(null);
  const [trimSilence, setTrimSilence] = useState(false);
  const [brandUrl, setBrandUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !videoUrl.trim()) return;
    setLoading(true);
    setStatus("");
    setResult(null);
    try {
      const formData = new FormData();
      if (file) formData.set("video", file);
      if (!file && videoUrl.trim()) formData.set("videoUrl", videoUrl.trim());
      if (trimSilence) formData.set("trimSilence", "true");
      if (brandUrl.trim()) formData.set("brandUrl", brandUrl.trim());
      const res = await fetch("/api/caption", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setResult({
        jobId: data.jobId,
        videoUrl: data.videoUrl,
        wordCount: data.wordCount,
      });
      setStatus("Transcription done. Redirecting to processing...");
      if (usage?.usage != null) {
        setUsage((u) =>
          u?.usage != null
            ? { ...u, usage: { ...u.usage, videosCount: u.usage.videosCount + 1 } }
            : u
        );
      }
      if (data.jobId) {
        window.location.href = `/dashboard/processing/${data.jobId}`;
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRender() {
    if (!result?.jobId) return;
    setRenderLoading(true);
    setStatus("Queuing render...");
    try {
      const res = await fetch(`/api/caption/${result.jobId}/render`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Render failed");
      if (data.outputUrl) {
        setResult((prev) =>
          prev ? { ...prev, outputUrl: data.outputUrl } : prev
        );
        setStatus("Done. Download your video below.");
      } else {
        setStatus(
          data.message ??
            "Render queued. This can take a few minutes for Lambda to finish."
        );
        pollJobStatus(result.jobId);
      }
      if (usage?.usage != null) {
        setUsage((u) =>
          u?.usage != null
            ? { ...u, usage: { ...u.usage, rendersCount: u.usage.rendersCount + 1 } }
            : u
        );
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Render failed");
    } finally {
      setRenderLoading(false);
    }
  }

  function pollJobStatus(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/caption/${jobId}`);
        const data = await res.json();
        if (data.outputUrl) {
          setResult((prev) =>
            prev ? { ...prev, outputUrl: data.outputUrl } : prev
          );
          setStatus("Done. Download your video below.");
          clearInterval(interval);
        } else if (data.renderStatus === "failed" || data.status === "failed") {
          setStatus(data.renderError ?? "Render failed.");
          clearInterval(interval);
        }
      } catch {
        // ignore
      }
    }, 5000);
    setTimeout(() => clearInterval(interval), 300000);
  }

  return (
    <DashboardShell
      title="New project"
      subtitle="Upload a long-form video and generate ready-to-publish clips in minutes."
      actions={
        <Link
          href="/dashboard/projects"
          className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
        >
          View projects
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="video" className="block text-sm font-medium text-zinc-700">
                Upload video file
              </label>
              <input
                id="video"
                type="file"
                accept="video/*"
                className="mt-2 block w-full text-sm text-zinc-600 file:mr-4 file:min-h-[44px] file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2.5 file:text-sm file:text-white"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <p className="mt-2 text-xs text-zinc-500">Best results with 720p+ videos under 30 minutes.</p>
            </div>
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-zinc-700">
                Or paste a video URL
              </label>
              <input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-semibold text-zinc-900">Project options</p>
              <div className="mt-3 space-y-3">
                {usage?.features?.trimSilence && (
                  <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={trimSilence}
                      onChange={(e) => setTrimSilence(e.target.checked)}
                      className="rounded border-zinc-300"
                    />
                    Trim silence automatically
                  </label>
                )}
                {usage?.features?.brandFromUrl && (
                  <div>
                    <label htmlFor="brandUrl" className="block text-sm font-medium text-zinc-700">
                      Brand URL (optional)
                    </label>
                    <input
                      id="brandUrl"
                      type="url"
                      placeholder="https://yoursite.com"
                      value={brandUrl}
                      onChange={(e) => setBrandUrl(e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!file && !videoUrl.trim())}
              className="touch-target min-h-[48px] w-full rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading ? "Transcribing…" : "Upload and transcribe"}
            </button>
          </form>

          {status && <p className="mt-4 text-sm text-zinc-600">{status}</p>}

          {result?.jobId && (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-[var(--muted-bg)] p-4 shadow-sm">
              <p className="text-sm text-zinc-600">
                Job: {result.jobId} · {result.wordCount ?? 0} words
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={`/dashboard/projects/${result.jobId}`}
                  className="touch-target inline-flex min-h-[40px] items-center text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  View project
                </Link>
                {usage?.features?.captionEditor && (
                  <Link
                    href={`/dashboard/editor/${result.jobId}`}
                    className="touch-target inline-flex min-h-[40px] items-center text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    Open editor
                  </Link>
                )}
              </div>
            <button
              type="button"
              onClick={handleRender}
              disabled={renderLoading || !usage?.features?.lambdaRender || usage?.renderingEnabled === false}
              className="touch-target mt-3 min-h-[48px] w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {renderLoading ? "Rendering…" : "Render captioned video"}
            </button>
            {!usage?.features?.lambdaRender && (
              <p className="mt-2 text-xs text-zinc-500">
                Lambda rendering is available on Pro and above.
              </p>
            )}
            {usage?.renderingEnabled === false && (
              <p className="mt-2 text-xs text-amber-600">
                Rendering is disabled until a Remotion Company License is active.
              </p>
            )}
              {result.outputUrl && (
                <p className="mt-3">
                  <a
                    href={result.outputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target inline-flex min-h-[40px] items-center text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    Download video
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {usage != null && usage.usage != null && usage.limits != null && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Usage</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">{usage.planName ?? "Starter"} plan</p>
              <p className="mt-2 text-xs text-zinc-500">
                Videos: {usage.usage?.videosCount ?? 0} / {usage.limits.videosPerMonth === -1 ? "∞" : usage.limits.videosPerMonth}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Renders: {usage.usage?.rendersCount ?? 0}</p>
              {usage.limits.apiCallsPerMonth !== 0 && (
                <p className="mt-1 text-xs text-zinc-500">
                  API: {usage.usage?.apiCallsCount ?? 0} / {usage.limits.apiCallsPerMonth === -1 ? "∞" : usage.limits.apiCallsPerMonth}
                </p>
              )}
              <Link
                href="/pricing"
                className="touch-target mt-4 inline-flex min-h-[40px] items-center text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Upgrade plan
              </Link>
              {usage.features?.apiAccess && (
                <p className="mt-2">
                  <Link
                    href="/dashboard/api-keys"
                    className="touch-target inline-flex min-h-[40px] items-center text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Manage API keys
                  </Link>
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Workflow</p>
            <ol className="mt-3 space-y-2 text-sm text-zinc-600">
              <li>Upload a long-form file or URL.</li>
              <li>We transcribe and identify highlight moments.</li>
              <li>Edit captions, then render short clips.</li>
            </ol>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
