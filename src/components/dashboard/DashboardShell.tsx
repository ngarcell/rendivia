import type { ReactNode } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}

export default function DashboardShell({ title, subtitle, actions, children, wide }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--muted-bg)]">
      <div className={`mx-auto px-4 py-6 sm:px-6 ${wide ? "max-w-[1600px]" : "max-w-7xl"}`}>
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Workspace</p>
                <p className="text-lg font-semibold text-zinc-900">Rendivia Studio</p>
                <p className="text-xs text-zinc-500">Enterprise workflow</p>
              </div>
            </div>

            <div className="mt-6 flex-1">
              <DashboardNav />
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-700">Need help?</p>
              <p className="mt-1">Response SLA and onboarding are available on Team and Enterprise.</p>
              <a
                href="mailto:founders@rendivia.ai"
                className="mt-2 inline-flex text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Contact support
              </a>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-900 title-animate">{title}</h1>
                  {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
              </div>
              <div className="mt-4 lg:hidden">
                <DashboardNav variant="mobile" />
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
