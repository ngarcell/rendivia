import Link from "next/link";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";
import UseCaseCard from "@/components/UseCaseCard";
import { getPseoPagesByType } from "@/lib/pseo";

export const metadata = {
  title: "Programmatic Video Use Cases by Industry | Rendivia",
  description:
    "Explore programmatic video generation use cases across industries. Turn structured data into branded MP4 videos via API.",
};

export default function UseCasesHub() {
  const pages = getPseoPagesByType("use_case");
  const dataSources = getPseoPagesByType("data_source").slice(0, 3);
  const triggers = getPseoPagesByType("trigger").slice(0, 3);
  const industries = Array.from(
    new Set(
      pages
        .map((page) => page.canonicalUrl.match(/^\/use-cases\/([^/]+)\//)?.[1])
        .filter(Boolean) as string[]
    )
  ).sort();

  const formatLabel = (input: string) =>
    input
      .replace(/-/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" ");

  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Use Cases", href: "/use-cases" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
          Use cases for programmatic video
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Each page shows a concrete JSON example, deterministic rendering flow, and how teams automate
          video from structured data.
        </p>
        {industries.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-500">Browse by industry:</span>
            {industries.map((industry) => (
              <Link
                key={industry}
                href={`/use-cases/${industry}`}
                className="touch-target inline-flex min-h-[32px] items-center font-semibold text-zinc-500 hover:text-zinc-700"
              >
                {formatLabel(industry)}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-500">Explore:</span>
          <Link
            href="/from"
            className="touch-target inline-flex min-h-[32px] items-center font-semibold text-zinc-500 hover:text-zinc-700"
          >
            Data sources
          </Link>
          <Link
            href="/when"
            className="touch-target inline-flex min-h-[32px] items-center font-semibold text-zinc-500 hover:text-zinc-700"
          >
            Triggers
          </Link>
          <Link
            href="/docs"
            className="touch-target inline-flex min-h-[32px] items-center font-semibold text-zinc-500 hover:text-zinc-700"
          >
            Docs
          </Link>
        </div>

        {pages.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 p-8 text-sm text-zinc-600">
            No use-case pages have been generated yet.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <UseCaseCard
                key={page.canonicalUrl}
                title={page.title}
                description={page.hero.subheadline}
                href={page.canonicalUrl}
              />
            ))}
          </div>
        )}

        {(dataSources.length > 0 || triggers.length > 0) && (
          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            {dataSources.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">Related data sources</h2>
                  <Link href="/from" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                    View all
                  </Link>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {dataSources.map((page) => (
                    <UseCaseCard
                      key={page.canonicalUrl}
                      title={page.title}
                      description={page.hero.subheadline}
                      href={page.canonicalUrl}
                    />
                  ))}
                </div>
              </div>
            )}
            {triggers.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">Related triggers</h2>
                  <Link href="/when" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                    View all
                  </Link>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {triggers.map((page) => (
                    <UseCaseCard
                      key={page.canonicalUrl}
                      title={page.title}
                      description={page.hero.subheadline}
                      href={page.canonicalUrl}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
