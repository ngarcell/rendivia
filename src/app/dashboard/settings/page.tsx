"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";

type Preset = {
  id: string;
  name: string;
  style_json: Record<string, unknown>;
  created_at: string;
};

type UsageRes = {
  planId: string;
  planName: string;
  limits: { videosPerMonth: number; apiCallsPerMonth: number };
  usage: { videosCount: number; rendersCount: number; apiCallsCount: number };
  features: Record<string, boolean>;
  remotionLicensed?: boolean;
  renderingEnabled?: boolean;
};

export default function SettingsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<UsageRes | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/brand-presets")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setPresets(Array.isArray(d.presets) ? d.presets : []);
      })
      .catch(() => setError("Failed to load presets"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function deletePreset(id: string) {
    const res = await fetch(`/api/brand-presets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPresets((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <DashboardShell
      title="Settings"
      subtitle="Manage billing, presets, and team governance in one place."
      actions={
        <Link
          href="/dashboard/renders"
          className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
        >
          Back to renders
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Brand presets</h2>
            <p className="mt-1 text-xs text-zinc-500">Manage caption styles saved from the editor.</p>
            {loading && <p className="mt-4 text-sm text-zinc-600">Loading presets…</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {!loading && !error && presets.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 p-6">
                <p className="text-sm text-zinc-600">No presets yet. Create one in the editor.</p>
                <Link
                  href="/dashboard/projects"
                  className="touch-target mt-2 inline-flex min-h-[40px] items-center text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Open a project
                </Link>
              </div>
            )}
            <div className="mt-4 grid gap-3">
              {presets.map((preset) => (
                <div key={preset.id} className="rounded-2xl border border-zinc-200 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{preset.name}</p>
                      <p className="text-xs text-zinc-500">{new Date(preset.created_at).toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deletePreset(preset.id)}
                      className="touch-target inline-flex min-h-[36px] items-center rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600 hover:border-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Team</h2>
            <p className="mt-1 text-xs text-zinc-500">Seats, SSO, and shared presets.</p>
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600">
              Team management is coming soon.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {usage && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Plan</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">{usage.planName ?? "Starter"}</p>
              <div className="mt-3 space-y-1 text-xs text-zinc-500">
                <div>Videos: {usage.usage?.videosCount ?? 0} / {usage.limits.videosPerMonth === -1 ? "∞" : usage.limits.videosPerMonth}</div>
                <div>Renders: {usage.usage?.rendersCount ?? 0}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/pricing"
                  className="touch-target inline-flex min-h-[40px] items-center text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  Manage billing
                </Link>
                {usage.features?.apiAccess && (
                  <Link
                    href="/dashboard/api-keys"
                    className="touch-target inline-flex min-h-[40px] items-center text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    API keys
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Security</p>
            <div className="mt-3 space-y-2 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Single sign-on</span>
                <span className="text-xs font-semibold text-zinc-900">Enterprise</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Audit logs</span>
                <span className="text-xs font-semibold text-zinc-900">Planned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
