"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  accent?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Renders", href: "/dashboard/renders" },
      { label: "Brands", href: "/dashboard/brands" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "API keys", href: "/dashboard/api-keys" },
      { label: "Settings", href: "/dashboard/settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard/renders") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/renders");
  }
  return pathname.startsWith(href);
}

export default function DashboardNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    const flat = NAV_SECTIONS.flatMap((section) => section.items);
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {flat.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`touch-target inline-flex min-h-[40px] items-center rounded-full border px-3 text-xs font-medium transition ${
                active
                  ? "border-[var(--accent-secondary)] bg-[var(--accent-light)] text-[var(--accent-secondary)]"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {section.label}
          </p>
          <div className="mt-2 space-y-1">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`touch-target flex min-h-[40px] items-center justify-between rounded-full border px-3 text-sm font-medium transition ${
                    active
                      ? "border-[var(--accent-secondary)] bg-[var(--accent-light)] text-[var(--accent-secondary)]"
                      : "border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.accent && (
                    <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--accent)]">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
