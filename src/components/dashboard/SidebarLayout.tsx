"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard" },
  { label: "API Keys", href: "/dashboard/api-keys" },
  { label: "Templates", href: "/dashboard/templates" },
  { label: "Brand Profiles", href: "/dashboard/brands" },
  { label: "Renders", href: "/dashboard/renders" },
  { label: "Usage & Billing", href: "/dashboard/billing" },
  { label: "Docs", href: "/docs" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(href);
}

export default function SidebarLayout({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="surface-card p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Dashboard</p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">Rendivia</p>
            <nav className="mt-6 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`touch-target flex min-h-[40px] items-center justify-between rounded-full px-3 text-sm font-medium transition ${
                      active
                        ? "bg-[var(--accent-light)] text-[var(--accent-secondary)]"
                        : "text-zinc-600 hover:bg-white hover:text-zinc-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-6">
            <div className="surface-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-900 title-animate">{title}</h1>
                  {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
