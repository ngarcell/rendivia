import Link from "next/link";
import type { Metadata } from "next";
import {
  type ToolCategory,
  TOOL_CATEGORIES,
  getAllToolEntriesByCategory,
} from "@/data/tools";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Rendivia Tools — Clips by Platform, Language, and Use Case",
  description:
    "Browse clip workflows by platform, language, and use case. Turn long-form content into short clips with captions and brand presets.",
  openGraph: {
    title: "Rendivia Tools — Clips by Platform, Language, and Use Case",
    description:
      "Browse clip workflows by platform, language, and use case. Turn long-form content into short clips with captions and brand presets.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Rendivia Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rendivia Tools — Clips by Platform, Language, and Use Case",
    description:
      "Browse clip workflows by platform, language, and use case. Turn long-form content into short clips with captions and brand presets.",
    images: ["/og.svg"],
  },
};

const SECTION_TITLES: Record<ToolCategory, string> = {
  platform: "By platform",
  language: "By language",
  "use-case": "By use case",
  feature: "By feature",
  vertical: "By vertical",
  "platform-language": "By platform & language",
};

const POPULAR_LINKS = [
  { href: "/tools/platform/youtube-shorts-captions", label: "YouTube Shorts clips" },
  { href: "/tools/platform/tiktok-caption-generator", label: "TikTok clip captions" },
  { href: "/tools/language/spanish-subtitles", label: "Spanish captions" },
  { href: "/tools/use-case/podcast-to-shorts", label: "Podcast to Shorts" },
  { href: "/tools/platform-language/tiktok-spanish", label: "TikTok in Spanish" },
  { href: "/tools/vertical/agencies-video-captions", label: "Agency clip workflows" },
];

export default function ToolsPage() {
  const dataByCategory = getAllToolEntriesByCategory();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — matches homepage */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border border-indigo-200/60 opacity-40" />
          <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full border border-pink-200/60 opacity-40" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600">
            Tools
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl title-animate">
            Clip creation for{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
              every platform
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
            Turn long videos into short clips for YouTube, TikTok, Reels, and more. Choose a platform, language, or use case to find the right workflow.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-zinc-500">
            <Link href="/pricing" className="hover:text-zinc-700">Pricing</Link>
            <span>·</span>
            <Link href="/dashboard/new" className="hover:text-zinc-700">Start a project</Link>
          </div>
        </div>
      </section>

      {/* Popular tools — premium card grid */}
      <section className="border-t border-zinc-200 bg-[var(--muted-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              Most used
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Popular tools
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-zinc-500">
              Start with the most common clip workflows.
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="touch-target group block min-h-[72px] rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                >
                  <span className="font-medium text-zinc-900 group-hover:text-[var(--accent)]">
                    {link.label}
                  </span>
                  <span className="mt-2 block text-sm text-zinc-500 group-hover:text-zinc-600">
                    View tool →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Category sections — same card style as homepage */}
      <section className="border-t border-zinc-200 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
            Browse by category
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Platform, language, use case, feature, vertical
          </h2>

          {TOOL_CATEGORIES.map((category) => {
            const entries = dataByCategory[category];
            if (!entries?.length) return null;
            return (
              <div key={category} className="mt-12">
                <h3 className="text-xl font-semibold text-zinc-900">
                  {SECTION_TITLES[category]}
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        href={`/tools/${category}/${entry.slug}`}
                        className="touch-target block min-h-[72px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <span className="font-medium text-zinc-900">
                          {entry.name}
                        </span>
                        <p className="mt-1 text-sm text-zinc-500">
                          {entry.primaryKeyword}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[var(--muted-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600">
            Pick a workflow, upload a long video, and ship clips in minutes.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Upload",
                text: "Send a webinar, demo, or podcast to Rendivia.",
              },
              {
                title: "Select clips",
                text: "Review auto‑suggested segments and tweak the transcript.",
              },
              {
                title: "Render",
                text: "Apply your brand preset and export Shorts‑ready MP4s.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-zinc-900">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
