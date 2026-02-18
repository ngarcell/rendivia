import type { Metadata } from "next";
import Link from "next/link";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";
import UseCaseCard from "@/components/UseCaseCard";
import { getPseoPagesByType } from "@/lib/pseo";

type Params = { industry: string };

function formatIndustryLabel(input?: string) {
  if (!input) return "Industry";
  return input
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function generateStaticParams(): Params[] {
  const pages = getPseoPagesByType("use_case");
  const industries = Array.from(
    new Set(
      pages
        .map((page) => page.canonicalUrl.match(/^\/use-cases\/([^/]+)\//)?.[1])
        .filter(Boolean) as string[]
    )
  );
  return industries.map((industry) => ({ industry }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { industry } = await params;
  const industryLabel = formatIndustryLabel(industry);
  return {
    title: `${industryLabel} Use Cases | Programmatic Video API`,
    description: `Explore ${industryLabel.toLowerCase()} use cases for programmatic video generation. Deterministic templates, JSON input, and API-driven MP4 output.`,
  };
}

export default async function IndustryUseCasesPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { industry } = await params;
  const industryLabel = formatIndustryLabel(industry);
  const pages = getPseoPagesByType("use_case").filter((page) =>
    page.canonicalUrl.startsWith(`/use-cases/${industry}/`)
  );

  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Use Cases", href: "/use-cases" },
          { name: industryLabel, href: `/use-cases/${industry}` },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Use cases
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
              {industryLabel} programmatic video use cases
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-600">
              Deterministic video templates for {industryLabel.toLowerCase()} teams, powered by JSON
              input and an API-first rendering workflow.
            </p>
          </div>
          <Link
            href="/use-cases"
            className="touch-target text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Browse all industries
          </Link>
        </div>

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
            No use-case pages found for this industry.
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
      </main>
    </div>
  );
}
