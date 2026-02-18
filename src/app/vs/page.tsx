import Link from "next/link";
import { ComparisonHubClient } from "@/components/ComparisonHubClient";
import { getComparisonHubEntries } from "@/data/seo";
import { SiteFooter } from "@/components/SiteFooter";

export default function ComparisonsHubPage() {
  const entries = getComparisonHubEntries();

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-20 -top-16 h-80 w-80 rounded-full border border-indigo-200/60 opacity-40" />
          <div className="absolute -right-28 top-1/3 h-72 w-72 rounded-full border border-pink-200/60 opacity-40" />
        </div>
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Comparisons
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl title-animate">
            Find the right tool for your caption workflow
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Compare Rendivia against the tools your team already uses. Every page includes a feature matrix, pros and cons, and use-case guidance.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-zinc-500">
            <Link href="/tools" className="hover:text-zinc-700">Browse tools</Link>
            <span>·</span>
            <Link href="/pricing" className="hover:text-zinc-700">Pricing</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[var(--muted-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ComparisonHubClient entries={entries} />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "Rendivia Comparisons | Rendivia",
    description:
      "Compare Rendivia with top video editing and captioning tools. See features, use cases, and workflows for short-form teams.",
  };
}
