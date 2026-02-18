import DashboardShell from "@/components/dashboard/DashboardShell";

export default function ApiKeysLoading() {
  return (
    <DashboardShell title="API keys" subtitle="Loading credentials...">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="mt-8 h-8 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-zinc-200" />
        <div className="mt-8 space-y-4">
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
          <div className="h-12 w-full animate-pulse rounded-md bg-zinc-100" />
          <div className="h-12 w-36 animate-pulse rounded-lg bg-zinc-200" />
        </div>
      </div>
    </DashboardShell>
  );
}
