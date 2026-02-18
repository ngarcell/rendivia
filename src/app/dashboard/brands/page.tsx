"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SidebarLayout from "@/components/dashboard/SidebarLayout";

type BrandProfile = {
  id: string;
  name: string;
  logo_url: string | null;
  colors: Record<string, string>;
  font_family: string | null;
  intro_text: string | null;
  outro_text: string | null;
  created_at: string;
};

type FormState = {
  name: string;
  logoUrl: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  fontFamily: string;
  introText: string;
  outroText: string;
  introEnabled: boolean;
  outroEnabled: boolean;
};

const FONT_OPTIONS = ["IBM Plex Sans", "Space Grotesk", "JetBrains Mono", "Inter"];

const EMPTY_FORM: FormState = {
  name: "",
  logoUrl: "",
  primary: "#f8fafc",
  secondary: "#cbd5f5",
  accent: "#2563eb",
  background: "#0f172a",
  fontFamily: "IBM Plex Sans",
  introText: "",
  outroText: "",
  introEnabled: false,
  outroEnabled: false,
};

export default function BrandsPage() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/brand-profiles")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setProfiles(Array.isArray(d.profiles) ? d.profiles : []);
      })
      .catch(() => setError("Failed to load brand profiles"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleEdit(profile: BrandProfile) {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      logoUrl: profile.logo_url ?? "",
      primary: profile.colors?.primary ?? EMPTY_FORM.primary,
      secondary: profile.colors?.secondary ?? EMPTY_FORM.secondary,
      accent: profile.colors?.accent ?? EMPTY_FORM.accent,
      background: profile.colors?.background ?? EMPTY_FORM.background,
      fontFamily: profile.font_family ?? EMPTY_FORM.fontFamily,
      introText: profile.intro_text ?? "",
      outroText: profile.outro_text ?? "",
      introEnabled: Boolean(profile.intro_text),
      outroEnabled: Boolean(profile.outro_text),
    });
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/brand-profiles/logo", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((prev) => ({ ...prev, logoUrl: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Brand name is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      logoUrl: form.logoUrl || null,
      colors: {
        primary: form.primary,
        secondary: form.secondary,
        accent: form.accent,
        background: form.background,
      },
      fontFamily: form.fontFamily || null,
      introText: form.introEnabled ? form.introText || null : null,
      outroText: form.outroEnabled ? form.outroText || null : null,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/brand-profiles/${editingId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update brand");
        setProfiles((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  name: payload.name,
                  logo_url: payload.logoUrl,
                  colors: payload.colors,
                  font_family: payload.fontFamily,
                  intro_text: payload.introText,
                  outro_text: payload.outroText,
                }
              : item
          )
        );
        resetForm();
      } else {
        const res = await fetch("/api/brand-profiles", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create brand");
        setProfiles((prev) => [data.profile as BrandProfile, ...prev]);
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save brand");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/brand-profiles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProfiles((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    }
  }

  return (
    <SidebarLayout title="Brand Profiles" subtitle="Define brand styling for deterministic renders.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            {editingId ? "Edit brand profile" : "Create brand profile"}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">Attach profiles with the brand field in /render.</p>

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-zinc-600">Brand name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="Acme"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600">Logo</label>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  className="text-xs"
                />
                {uploading && <span className="text-xs text-zinc-500">Uploading...</span>}
                {form.logoUrl && (
                  <Image
                    src={form.logoUrl}
                    alt="Logo preview"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md object-contain"
                    unoptimized
                  />
                )}
              </div>
              <input
                value={form.logoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-zinc-600">Primary</label>
                <input
                  type="color"
                  value={form.primary}
                  onChange={(e) => setForm((prev) => ({ ...prev, primary: e.target.value }))}
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-200 p-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600">Accent</label>
                <input
                  type="color"
                  value={form.accent}
                  onChange={(e) => setForm((prev) => ({ ...prev, accent: e.target.value }))}
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-200 p-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600">Secondary</label>
                <input
                  type="color"
                  value={form.secondary}
                  onChange={(e) => setForm((prev) => ({ ...prev, secondary: e.target.value }))}
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-200 p-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600">Background</label>
                <input
                  type="color"
                  value={form.background}
                  onChange={(e) => setForm((prev) => ({ ...prev, background: e.target.value }))}
                  className="mt-2 h-10 w-full rounded-lg border border-zinc-200 p-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600">Font family</label>
              <select
                value={form.fontFamily}
                onChange={(e) => setForm((prev) => ({ ...prev, fontFamily: e.target.value }))}
                className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                <input
                  type="checkbox"
                  checked={form.introEnabled}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, introEnabled: e.target.checked }))
                  }
                />
                Intro text
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                <input
                  type="checkbox"
                  checked={form.outroEnabled}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, outroEnabled: e.target.checked }))
                  }
                />
                Outro text
              </label>
            </div>

            {form.introEnabled && (
              <div>
                <input
                  value={form.introText}
                  onChange={(e) => setForm((prev) => ({ ...prev, introText: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Weekly summary"
                />
              </div>
            )}

            {form.outroEnabled && (
              <div>
                <input
                  value={form.outroText}
                  onChange={(e) => setForm((prev) => ({ ...prev, outroText: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  placeholder="Generated by Rendivia"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
              >
                {editingId ? "Save changes" : "Create brand"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Saved brands</h2>
          {loading && <p className="mt-4 text-sm text-zinc-600">Loading brands...</p>}
          {!loading && profiles.length === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600">
              No brand profiles yet. Create one to attach to render jobs.
            </div>
          )}
          <div className="mt-4 space-y-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{profile.name}</p>
                    <p className="text-xs text-zinc-500">Brand key: {profile.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(profile)}
                      className="text-xs font-semibold text-[var(--accent)] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span>Primary {profile.colors?.primary ?? "#f8fafc"}</span>
                  <span>Accent {profile.colors?.accent ?? "#2563eb"}</span>
                  {profile.font_family && <span>Font {profile.font_family}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
