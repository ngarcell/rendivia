import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

/**
 * Shared footer for all landing pages - matches homepage structure.
 * Light theme: clear hierarchy, smart placement of links.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-[var(--surface)] px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Link
            href="/"
            className="touch-target inline-flex min-h-[44px] min-w-[44px] items-center rounded-xl px-1 py-1"
          >
            <BrandLogo
              markClassName="h-9 w-9"
              wordmarkClassName="text-sm tracking-[0.12em]"
              variant="modern"
            />
          </Link>
          <div className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6">
            <Link
              href="/docs"
              className="touch-target inline-flex min-h-[44px] items-center text-sm text-zinc-600 hover:text-zinc-900"
            >
              Docs
            </Link>
            <Link
              href="/docs#api-reference"
              className="touch-target inline-flex min-h-[44px] items-center text-sm text-zinc-600 hover:text-zinc-900"
            >
              API Reference
            </Link>
            <Link
              href="/use-cases"
              className="touch-target inline-flex min-h-[44px] items-center text-sm text-zinc-600 hover:text-zinc-900"
            >
              Use cases
            </Link>
            <Link
              href="/status"
              className="touch-target inline-flex min-h-[44px] items-center text-sm text-zinc-600 hover:text-zinc-900"
            >
              Status
            </Link>
            <Link
              href="/enterprise"
              className="touch-target inline-flex min-h-[44px] items-center text-sm text-zinc-600 hover:text-zinc-900"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="touch-target inline-flex min-h-[44px] items-center text-sm text-zinc-600 hover:text-zinc-900"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="touch-target inline-flex min-h-[44px] items-center text-sm text-zinc-600 hover:text-zinc-900"
            >
              Terms
            </Link>
          </div>
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-zinc-500 sm:gap-x-3">
          <span className="shrink-0">Explore:</span>
          <Link href="/use-cases" className="touch-target inline-flex min-h-[44px] items-center hover:text-zinc-700">
            Use cases
          </Link>
          <span aria-hidden>|</span>
          <Link href="/from" className="touch-target inline-flex min-h-[44px] items-center hover:text-zinc-700">
            Data sources
          </Link>
          <span aria-hidden>|</span>
          <Link href="/when" className="touch-target inline-flex min-h-[44px] items-center hover:text-zinc-700">
            Triggers
          </Link>
          <span aria-hidden>|</span>
          <Link href="/docs" className="touch-target inline-flex min-h-[44px] items-center hover:text-zinc-700">
            Docs
          </Link>
          <span aria-hidden>|</span>
          <Link href="/status" className="touch-target inline-flex min-h-[44px] items-center hover:text-zinc-700">
            Status
          </Link>
        </p>
      </div>
    </footer>
  );
}
