import Link from "next/link";
import type { ToolCategory, ToolEntry } from "@/data/tools";
import { getToolMarketingVideoUrl, marketingVideosEnabled } from "@/lib/marketing-videos";

export type RelatedTool = { category: ToolCategory; slug: string; name: string };

interface ToolPageTemplateProps {
  entry: ToolEntry;
  category: ToolCategory;
  categoryLabel: string;
  related?: RelatedTool[];
}

const BROWSE_LINKS: { category: ToolCategory; label: string }[] = [
  { category: "platform", label: "By platform" },
  { category: "language", label: "By language" },
  { category: "use-case", label: "By use case" },
  { category: "feature", label: "By feature" },
  { category: "vertical", label: "By vertical" },
  { category: "platform-language", label: "By platform & language" },
];

export function ToolPageTemplate({ entry, category, categoryLabel, related = [] }: ToolPageTemplateProps) {
  const videoUrl = marketingVideosEnabled() ? getToolMarketingVideoUrl(category, entry.slug) : null;
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <nav className="text-sm text-zinc-600">
          <Link href="/tools" className="touch-target inline-flex min-h-[44px] items-center font-medium hover:text-zinc-900">
            Tools
          </Link>
          <span className="mx-1">·</span>
          <span className="text-zinc-500">{categoryLabel}</span>
        </nav>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
          {entry.primaryKeyword}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          {entry.description}
        </p>

        {videoUrl && (
          <section className="mt-8">
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
              Programmatic preview generated from this page’s content.
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">
            Why use Rendivia for this
          </h2>
          <p className="mt-3 text-zinc-600">
            {entry.intro}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">
            How it works
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-zinc-600">
            {entry.howToSteps.map((step, i) => (
              <li key={i} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">
            Benefits
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-600">
            {entry.benefits.map((benefit, i) => (
              <li key={i} className="pl-1">
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-zinc-900">
            Frequently asked questions
          </h2>
          <ul className="mt-4 space-y-6">
            {entry.faqs.map((faq, i) => (
              <li key={i} className="border-b border-zinc-200 pb-6 last:border-0">
                <h3 className="font-medium text-zinc-900">
                  {faq.question}
                </h3>
                <p className="mt-2 text-zinc-600">
                  {faq.answer}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-zinc-900">Related tools</h2>
            <ul className="mt-3 flex flex-wrap gap-2 sm:gap-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/tools/${r.category}/${r.slug}`}
                    className="touch-target inline-flex min-h-[44px] items-center rounded-lg border border-zinc-200 bg-[var(--muted-bg)] px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-zinc-700">Browse more</h2>
          <p className="mt-2 flex flex-wrap gap-x-1 gap-y-1 text-sm text-zinc-600">
            {BROWSE_LINKS.map((b, i) => (
              <span key={b.category}>
                {i > 0 && " · "}
                <Link href="/tools" className="underline hover:no-underline">
                  {b.label}
                </Link>
              </span>
            ))}
          </p>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href="/dashboard"
            className="touch-target inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] sm:w-auto"
          >
            {entry.cta}
          </Link>
          <Link
            href="/pricing"
            className="touch-target inline-flex min-h-[44px] items-center text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            See pricing
          </Link>
          <Link href="/tools" className="touch-target inline-flex min-h-[44px] items-center text-sm font-medium text-zinc-600 hover:text-zinc-900">
            All tools
          </Link>
        </div>

        <p className="mt-10 text-sm text-zinc-500">
          Rendivia uses Remotion for programmatic video and Whisper for
          transcription. Starter free; Pro and Team for trim, brand-from-URL,
          API, and data-to-video. <Link href="/pricing" className="underline hover:no-underline">See pricing</Link>.
          <Link href="/tools" className="ml-1 underline hover:no-underline">Browse tools by platform, language, or use case</Link>.
        </p>
      </main>
    </div>
  );
}
