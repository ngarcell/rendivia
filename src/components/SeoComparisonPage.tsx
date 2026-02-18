import Link from "next/link";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";
import type { ComparisonEntry, ComparisonHubEntry } from "@/data/seo";
import { SiteFooter } from "@/components/SiteFooter";
import { getComparisonMarketingVideoUrl, marketingVideosEnabled } from "@/lib/marketing-videos";

interface SeoComparisonPageProps {
  entry: ComparisonEntry;
  related: ComparisonHubEntry[];
}

export function SeoComparisonPage({ entry, related }: SeoComparisonPageProps) {
  const videoUrl = marketingVideosEnabled() ? getComparisonMarketingVideoUrl(entry.slug) : null;
  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Comparisons", href: "/vs" },
          { name: entry.title, href: `/vs/${entry.slug}` },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-800">Home</Link>
          <span className="mx-2">·</span>
          <Link href="/vs" className="hover:text-zinc-800">Comparisons</Link>
          <span className="mx-2">·</span>
          <span className="text-zinc-700">{entry.title}</span>
        </nav>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl title-animate">
              {entry.title}
            </h1>
            <p className="mt-4 text-lg text-zinc-600">
              {entry.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="touch-target inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
              >
                Try Rendivia free
              </Link>
              <Link
                href="/pricing"
                className="touch-target inline-flex min-h-[48px] items-center justify-center rounded-lg border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300"
              >
                See pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Comparison is based on publicly available information and may change. Always verify features with the vendor.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-[var(--muted-bg)] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-[var(--accent)] shadow-sm">
                V
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-zinc-700 shadow-sm">
                {entry.competitor.name.slice(0, 1).toUpperCase()}
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">Quick verdict</p>
            <p className="mt-2 text-base text-zinc-700">
              Rendivia wins when you need fast, brand-consistent captions at scale. {entry.competitor.name} is stronger when you want broader editing capabilities in the same tool.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-zinc-600">
              <span className="rounded-full bg-white px-3 py-1">Short-form focus</span>
              <span className="rounded-full bg-white px-3 py-1">Word-level captions</span>
              <span className="rounded-full bg-white px-3 py-1">API workflows</span>
            </div>
          </div>
        </section>

        {videoUrl && (
          <section className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-black shadow-sm">
              <video
                src={videoUrl}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Programmatic comparison video generated from this page.
            </p>
          </section>
        )}

        <section className="mt-12 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">Why teams choose Rendivia</h2>
              <p className="mt-2 text-zinc-600">Built for repeatable, branded captions with short-form speed.</p>
            </div>
            <div className="rounded-2xl bg-[var(--accent-light)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Trusted by modern creator teams</div>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {entry.whyRendivia.map((item) => (
              <li key={item} className="rounded-2xl border border-zinc-200 bg-[var(--muted-bg)] px-4 py-3 text-sm text-zinc-700">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Overview</h2>
          <p className="mt-3 text-zinc-600">
            {entry.intro}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Feature comparison</h2>
          <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--muted-bg)] text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Feature</th>
                  <th className="px-4 py-3 font-medium">Rendivia</th>
                  <th className="px-4 py-3 font-medium">{entry.competitor.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {entry.featureMatrix.map((row) => (
                  <tr key={row.feature} className="bg-white">
                    <td className="px-4 py-3 font-medium text-zinc-700">{row.feature}</td>
                    <td className="px-4 py-3 text-zinc-600">{row.rendivia}</td>
                    <td className="px-4 py-3 text-zinc-600">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Feature availability can vary by plan. Verify with the vendor for the latest details.</p>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Rendivia pros</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-600">
              {entry.pros.rendivia.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h4 className="mt-6 text-sm font-semibold text-zinc-700">Rendivia cons</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
              {entry.cons.rendivia.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-zinc-900">{entry.competitor.name} pros</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-600">
              {entry.pros.competitor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h4 className="mt-6 text-sm font-semibold text-zinc-700">{entry.competitor.name} cons</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
              {entry.cons.competitor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Who is each tool best for?</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-[var(--muted-bg)] p-6">
              <h3 className="text-lg font-semibold text-zinc-900">Choose Rendivia if you need</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-600">
                {entry.useCases.rendivia.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-[var(--muted-bg)] p-6">
              <h3 className="text-lg font-semibold text-zinc-900">Choose {entry.competitor.name} if you need</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-600">
                {entry.useCases.competitor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-zinc-900">Pricing notes</h2>
          <p className="mt-3 text-sm text-zinc-600">{entry.pricingNote}</p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {entry.faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
                <summary className="cursor-pointer text-sm font-medium text-zinc-900">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-zinc-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-zinc-900">Compare more</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/vs/${item.slug}`}
                    className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                    <p className="mt-2 text-xs text-zinc-500">{item.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-14 rounded-3xl border border-zinc-200 bg-[var(--muted-bg)] p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">Ready to ship captions faster?</h2>
            <p className="mt-2 text-sm text-zinc-600">Create your first branded caption export in minutes.</p>
          </div>
          <div className="mt-4 flex gap-3 sm:mt-0">
            <Link
              href="/dashboard"
              className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              Start free
            </Link>
            <Link
              href="/tools"
              className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300"
            >
              Browse tools
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
