"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/dashboard/SidebarLayout";

type DailyBucket = {
  date: string;
  total: number;
  completed: number;
  failed: number;
};

type UsageRes = {
  planName: string;
  limits: { videosPerMonth: number };
  usage: { rendersCount: number };
};

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageRes | null>(null);
  const [daily, setDaily] = useState<DailyBucket[]>([]);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => setUsage(null));
  }, []);

  useEffect(() => {
    fetch("/api/render-jobs/summary?days=7")
      .then((r) => r.json())
      .then((d) => setDaily(Array.isArray(d.daily) ? d.daily : []))
      .catch(() => setDaily([]));
  }, []);

  const usagePercent = useMemo(() => {
    const renders = usage?.usage?.rendersCount ?? 0;
    const limit = usage?.limits?.videosPerMonth ?? 0;
    if (limit === -1 || limit === 0) return 0;
    return Math.min(100, Math.round((renders / limit) * 100));
  }, [usage]);

  const maxDaily = Math.max(...daily.map((item) => item.total), 1);

  return (
    <SidebarLayout title="Usage & Billing" subtitle="Track render volume and plan usage.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Renders per day</h2>
          <p className="mt-1 text-xs text-zinc-500">Actual trend for the last 7 days.</p>
          <div className="mt-6 flex items-end gap-2">
            {daily.map((item, index) => (
              <div key={item.date ?? index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-lg bg-[var(--accent)]"
                  style={{ height: `${Math.round((item.total / maxDaily) * 120) + 20}px` }}
                />
                <span className="text-[11px] text-zinc-500">{item.total}</span>
              </div>
            ))}
            {daily.length === 0 && (
              <div className="text-xs text-zinc-500">No render data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Usage vs plan</h2>
          <p className="mt-1 text-xs text-zinc-500">Current billing period usage.</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Renders used</span>
              <span>{usage?.usage?.rendersCount ?? 0} / {usage?.limits?.videosPerMonth === -1 ? "unlimited" : usage?.limits?.videosPerMonth ?? "-"}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-[var(--accent)]"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-zinc-200 bg-[var(--muted-bg)] p-4 text-xs text-zinc-600">
            <p className="font-semibold text-zinc-700">Plan</p>
            <p className="mt-1">{usage?.planName ?? "Starter"} - usage-based overages available.</p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
