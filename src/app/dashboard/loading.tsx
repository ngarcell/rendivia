import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardLoading() {
  return (
    <DashboardShell title="Dashboard" subtitle="Loading workspace...">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-zinc-200" />
        <div className="mt-2 h-4 w-full max-w-sm animate-pulse rounded bg-zinc-200" />
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-zinc-100" />
        <div className="mt-8 space-y-4">
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
          <div className="h-12 w-full animate-pulse rounded-md bg-zinc-100" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-zinc-200" />
        </div>
      </div>
    </DashboardShell>
  );
}
