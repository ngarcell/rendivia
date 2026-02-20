import Link from "next/link";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";
import UseCaseCard from "@/components/UseCaseCard";
import { getPseoPagesByType } from "@/lib/pseo";

export const metadata = {
  title: "Trigger-Based Video Generation | Rendivia",
  description:
    "Map product events to automated video generation. Trigger deterministic MP4 videos via API.",
};

export default function TriggerHub() {
  const pages = getPseoPagesByType("trigger");
  const featuredPages = pages.slice(0, 24);
  const useCases = getPseoPagesByType("use_case").slice(0, 3);
  const dataSources = getPseoPagesByType("data_source").slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "When", href: "/when" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
          Trigger-based video pages
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Connect events to programmatic video generation. Each page explains the JSON payload and render flow.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-500">Explore:</span>
          <Link
            href="/use-cases"
            className="touch-target inline-flex min-h-[32px] items-center font-semibold text-zinc-500 hover:text-zinc-700"
          >
            Use cases
          </Link>
          <Link
            href="/from"
            className="touch-target inline-flex min-h-[32px] items-center font-semibold text-zinc-500 hover:text-zinc-700"
          >
            Data sources
          </Link>
          <Link
            href="/docs"
            className="touch-target inline-flex min-h-[32px] items-center font-semibold text-zinc-500 hover:text-zinc-700"
          >
            Docs
          </Link>
        </div>
        {featuredPages.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 p-8 text-sm text-zinc-600">
            No trigger pages have been generated yet.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPages.map((page) => (
              <UseCaseCard
                key={page.canonicalUrl}
                title={page.title}
                description={page.hero.subheadline}
                href={page.canonicalUrl}
              />
            ))}
          </div>
        )}
        {pages.length > featuredPages.length && (
          <p className="mt-6 text-sm text-zinc-500">
            Showing {featuredPages.length} featured trigger routes from {pages.length} pages.
          </p>
        )}

        {(useCases.length > 0 || dataSources.length > 0) && (
          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            {useCases.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">Related use cases</h2>
                  <Link href="/use-cases" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                    View all
                  </Link>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {useCases.map((page) => (
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
          </div>
        )}
      </main>
    </div>
  );
}
