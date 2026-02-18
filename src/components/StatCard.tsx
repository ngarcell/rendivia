"use client";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
}

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="surface-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
      {helper && <p className="mt-1 text-xs text-zinc-500">{helper}</p>}
    </div>
  );
}
