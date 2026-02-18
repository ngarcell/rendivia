import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--accent)]">
          Error 404
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
          Page not found
        </h1>
        <p className="mt-4 text-zinc-600">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="touch-target inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
          >
            Back to home
          </Link>
          <Link
            href="/tools"
            className="touch-target inline-flex min-h-[48px] items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Browse tools
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
