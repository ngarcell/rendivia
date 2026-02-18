"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Player } from "@remotion/player";
import { CaptionVideo } from "@/remotion/CaptionVideo";
import {
  applySilentCuts,
  captionsToTranscript,
  getAspectRatioDimensions,
  getTimelineDurationSeconds,
  reflowCaptionsFromText,
  type CaptionEdits,
  type SilentPart,
  type TimelineClip,
} from "@/lib/caption-edits";
import { GOOGLE_FONT_OPTIONS } from "@/lib/google-fonts";

interface JobData {
  jobId: string;
  videoUrl?: string;
  outputUrl?: string;
  renderStatus?: string;
  renderError?: string;
  suggestedCuts?: { silentParts?: SilentPart[] };
}

interface BrandPreset {
  id: string;
  name: string;
  style_json: CaptionEdits["style"];
}

export default function CaptionEditorClient({ jobId, embedded = false }: { jobId: string; embedded?: boolean }) {
  const [job, setJob] = useState<JobData | null>(null);
  const [edits, setEdits] = useState<CaptionEdits | null>(null);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("");
  const [loadError, setLoadError] = useState("");
  const [rendering, setRendering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [presets, setPresets] = useState<BrandPreset[]>([]);
  const [splitTime, setSplitTime] = useState(0);
  const [newPresetName, setNewPresetName] = useState("");
  const [suggestedCuts, setSuggestedCuts] = useState<SilentPart[]>([]);
  const [renderingEnabled, setRenderingEnabled] = useState(true);

  useEffect(() => {
    async function load() {
      const jobRes = await fetch(`/api/caption/${jobId}`);
      const jobData = await jobRes.json();
      setJob(jobData);
      if (jobData.suggestedCuts?.silentParts) {
        setSuggestedCuts(jobData.suggestedCuts.silentParts);
      }

      const editsRes = await fetch(`/api/caption/${jobId}/edits`);
      const editsData = await editsRes.json();
      if (!editsRes.ok) {
        setLoadError(editsData?.error ?? "Unable to load editor");
        return;
      }
      if (editsData?.edits) {
        setEdits(editsData.edits);
        setTranscript(captionsToTranscript(editsData.edits.captions ?? []));
      }

      const presetsRes = await fetch("/api/brand-presets");
      const presetsData = await presetsRes.json();
      if (presetsData?.presets) setPresets(presetsData.presets);
    }
    load().catch(() => {});
  }, [jobId]);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => {
        if (d?.renderingEnabled === false) {
          setRenderingEnabled(false);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!job?.jobId) return;
    if (job.renderStatus !== "queued" && job.renderStatus !== "rendering") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/caption/${jobId}`);
      const data = await res.json();
      setJob((prev) => ({ ...prev, ...data }));
      if (data.outputUrl || data.renderStatus === "failed") {
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [job?.jobId, job?.renderStatus, jobId]);

  const compositionSize = useMemo(() => {
    if (!edits) return { width: 1080, height: 1920 };
    return getAspectRatioDimensions(edits.aspectRatio);
  }, [edits]);

  const durationInFrames = useMemo(() => {
    if (!edits) return 90;
    const durationSeconds = getTimelineDurationSeconds(edits.timeline);
    return Math.ceil(durationSeconds * 30);
  }, [edits]);

  function updateClip(index: number, patch: Partial<TimelineClip>) {
    if (!edits) return;
    const next = edits.timeline.map((clip, i) =>
      i === index ? { ...clip, ...patch } : clip
    );
    setEdits({ ...edits, timeline: next });
  }

  function removeClip(index: number) {
    if (!edits) return;
    const next = edits.timeline.filter((_, i) => i !== index);
    setEdits({ ...edits, timeline: next });
  }

  function moveClip(index: number, dir: -1 | 1) {
    if (!edits) return;
    const next = [...edits.timeline];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const [clip] = next.splice(index, 1);
    next.splice(target, 0, clip);
    setEdits({ ...edits, timeline: next });
  }

  function splitClipAt(time: number) {
    if (!edits) return;
    const next: TimelineClip[] = [];
    let splitDone = false;
    for (const clip of edits.timeline) {
      if (!splitDone && time > clip.start && time < clip.end) {
        next.push({ ...clip, end: time });
        next.push({ ...clip, id: `${clip.id}-b`, start: time });
        splitDone = true;
      } else {
        next.push(clip);
      }
    }
    setEdits({ ...edits, timeline: next });
  }

  async function saveEdits() {
    if (!edits) return;
    setSaving(true);
    setStatus("Saving edits...");
    try {
      const res = await fetch(`/api/caption/${jobId}/edits`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setStatus("Edits saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function applyTranscriptEdits() {
    if (!edits) return;
    const allCaptions = edits.captions ?? [];
    const startMs = allCaptions.length > 0 ? allCaptions[0].startMs : 0;
    const endMs = allCaptions.length > 0 ? allCaptions[allCaptions.length - 1].endMs : 1000;
    const nextCaptions = reflowCaptionsFromText(transcript, startMs, endMs);
    setEdits({ ...edits, captions: nextCaptions });
  }

  async function renderLambda() {
    if (!renderingEnabled) {
      setStatus("Rendering is disabled until a Remotion Company License is active.");
      return;
    }
    setRendering(true);
    setStatus("Queuing render...");
    try {
      const res = await fetch(`/api/caption/${jobId}/render`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Render failed");
      setStatus("Render queued. This can take a few minutes.");
      setJob((prev) => (prev ? { ...prev, renderStatus: "queued" } : prev));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Render failed");
    } finally {
      setRendering(false);
    }
  }

  async function generateCutSuggestions() {
    setStatus("Analyzing silence...");
    try {
      const res = await fetch(`/api/caption/${jobId}/suggest-cuts`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Suggest cuts failed");
      setSuggestedCuts(data.suggestedCuts?.silentParts ?? []);
      setStatus("Suggestions ready.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Suggest cuts failed");
    }
  }

  async function savePreset() {
    if (!edits) return;
    if (!newPresetName.trim()) return;
    const res = await fetch("/api/brand-presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPresetName.trim(), style: edits.style }),
    });
    const data = await res.json();
    if (res.ok && data?.preset) {
      setPresets((prev) => [data.preset, ...prev]);
      setNewPresetName("");
    }
  }

  const fontOptions = useMemo(() => {
    if (!edits) return GOOGLE_FONT_OPTIONS;
    const set = new Set<string>([edits.style.fontFamily, ...GOOGLE_FONT_OPTIONS]);
    return Array.from(set);
  }, [edits]);

  function wrap(content: React.ReactNode) {
    if (embedded) return <>{content}</>;
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-6xl px-4 py-10">{content}</main>
      </div>
    );
  }

  if (loadError) {
    const errorContent = (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {loadError}
      </div>
    );
    return wrap(errorContent);
  }

  if (!job || !edits) {
    const loadingContent = (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        Loading editor…
      </div>
    );
    return wrap(loadingContent);
  }

  const body = (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/projects"
            className="touch-target inline-flex min-h-[44px] items-center text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            ← Back to projects
          </Link>
          {job.outputUrl && (
            <a
              href={job.outputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Download latest render
            </a>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-zinc-200 bg-[var(--muted-bg)] p-4 shadow-sm">
            <p className="text-sm font-medium text-zinc-700">Preview</p>
            <div className="mt-3 overflow-hidden rounded-xl bg-black">
              <Player
                component={CaptionVideo}
                inputProps={{
                  captions: edits.captions,
                  timeline: edits.timeline,
                  style: edits.style,
                  aspectRatio: edits.aspectRatio,
                  videoSrc: job.videoUrl,
                }}
                durationInFrames={durationInFrames}
                fps={30}
                compositionWidth={compositionSize.width}
                compositionHeight={compositionSize.height}
                style={{ width: "100%" }}
                controls
                autoPlay={false}
                loop
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveEdits}
                disabled={saving}
                className="touch-target rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save edits"}
              </button>
              <button
                type="button"
                onClick={renderLambda}
                disabled={rendering || !renderingEnabled}
                className="touch-target rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
              >
                {rendering ? "Rendering…" : "Render via Lambda"}
              </button>
            </div>
            {status && <p className="mt-3 text-sm text-zinc-600">{status}</p>}
            {!renderingEnabled && (
              <p className="mt-2 text-sm text-amber-600">
                Rendering is disabled until a Remotion Company License is active.
              </p>
            )}
            {job.renderError && (
              <p className="mt-2 text-sm text-red-600">{job.renderError}</p>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Transcript</h2>
              <textarea
                className="mt-3 h-32 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              <button
                type="button"
                onClick={applyTranscriptEdits}
                className="mt-3 touch-target rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
              >
                Apply transcript edits
              </button>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Caption Style</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-zinc-600">
                  Font
                  <select
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                    value={edits.style.fontFamily}
                    onChange={(e) =>
                      setEdits({
                        ...edits,
                        style: { ...edits.style, fontFamily: e.target.value },
                      })
                    }
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Font size
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                    value={edits.style.fontSize}
                    onChange={(e) =>
                      setEdits({
                        ...edits,
                        style: { ...edits.style, fontSize: Number(e.target.value) },
                      })
                    }
                  />
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Primary color
                  <input
                    type="color"
                    className="mt-1 h-9 w-full rounded-lg border border-zinc-200"
                    value={edits.style.primaryColor}
                    onChange={(e) =>
                      setEdits({
                        ...edits,
                        style: { ...edits.style, primaryColor: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Highlight color
                  <input
                    type="color"
                    className="mt-1 h-9 w-full rounded-lg border border-zinc-200"
                    value={edits.style.highlightColor}
                    onChange={(e) =>
                      setEdits({
                        ...edits,
                        style: { ...edits.style, highlightColor: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Position
                  <select
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                    value={edits.style.position ?? "bottom"}
                    onChange={(e) =>
                      setEdits({
                        ...edits,
                        style: {
                          ...edits.style,
                          position: e.target.value as CaptionEdits["style"]["position"],
                        },
                      })
                    }
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Aspect ratio
                  <select
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                    value={edits.aspectRatio}
                    onChange={(e) =>
                      setEdits({
                        ...edits,
                        aspectRatio: e.target.value as CaptionEdits["aspectRatio"],
                      })
                    }
                  >
                    <option value="9:16">9:16</option>
                    <option value="1:1">1:1</option>
                    <option value="16:9">16:9</option>
                  </select>
                </label>
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-zinc-600">Save as preset</label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset name"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={savePreset}
                    className="touch-target rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
                  >
                    Save
                  </button>
                </div>
                {presets.length > 0 && (
                  <div className="mt-3">
                    <label className="text-xs font-medium text-zinc-600">Apply preset</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
                      onChange={(e) => {
                        const preset = presets.find((p) => p.id === e.target.value);
                        if (!preset) return;
                        setEdits({ ...edits, style: preset.style_json });
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Choose preset
                      </option>
                      {presets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Timeline</h2>
              <div className="mt-3 space-y-3">
                {edits.timeline.map((clip, index) => (
                  <div key={clip.id} className="rounded-lg border border-zinc-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-zinc-600">Clip {index + 1}</p>
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => moveClip(index, -1)}
                          className="text-zinc-500 hover:text-zinc-900"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveClip(index, 1)}
                          className="text-zinc-500 hover:text-zinc-900"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeClip(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="text-xs text-zinc-600">
                        Start (s)
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={clip.start}
                          onChange={(e) => updateClip(index, { start: Number(e.target.value) })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="text-xs text-zinc-600">
                        End (s)
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={clip.end}
                          onChange={(e) => updateClip(index, { end: Number(e.target.value) })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1 text-sm"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEdits({
                      ...edits,
                      timeline: [
                        ...edits.timeline,
                        {
                          id: `clip-${edits.timeline.length + 1}`,
                          start: 0,
                          end: 3,
                        },
                      ],
                    })
                  }
                  className="touch-target rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
                >
                  Add clip
                </button>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={splitTime}
                  onChange={(e) => setSplitTime(Number(e.target.value))}
                  className="w-24 rounded-lg border border-zinc-200 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => splitClipAt(splitTime)}
                  className="touch-target rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
                >
                  Split at (s)
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">Auto-cuts</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Detect silent parts and suggest cuts. Review before applying.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={generateCutSuggestions}
                  className="touch-target rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
                >
                  Generate suggestions
                </button>
                <button
                  type="button"
                  onClick={() => setEdits({ ...edits, timeline: applySilentCuts(edits.timeline, suggestedCuts) })}
                  className="touch-target rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
                >
                  Apply suggestions
                </button>
              </div>
              {suggestedCuts.length > 0 && (
                <ul className="mt-3 text-xs text-zinc-600">
                  {suggestedCuts.map((cut, idx) => (
                    <li key={`${cut.start}-${idx}`}>
                      Cut {idx + 1}: {cut.start.toFixed(2)}s → {cut.end.toFixed(2)}s
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
  );

  return wrap(body);
}
