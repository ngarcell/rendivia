import Link from "next/link";
import { ALTERNATIVES } from "@/data/pseo-api";

export const metadata = {
  title: "Alternatives to Manual Video Workflows | Rendivia",
  description:
    "Replace manual video workflows with a deterministic, API-first video generation platform.",
};

export default function AlternativesHub() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
          Replace manual workflows
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Move from manual video creation to deterministic JSON-driven rendering.
        </p>

        <div className="mt-10 grid gap-4">
          {ALTERNATIVES.map((alt) => (
            <Link
              key={alt.slug}
              href={`/alternatives/${alt.slug}`}
              className="touch-target flex min-h-[52px] items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300"
            >
              <span>{alt.name}</span>
              <span className="text-xs text-zinc-500">See alternative</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
