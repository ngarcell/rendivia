import Link from "next/link";
import type { Metadata } from "next";
import CodeBlock from "@/components/CodeBlock";
import FeatureGrid from "@/components/FeatureGrid";
import EarlyAccessForm from "@/components/EarlyAccessForm";
import HeroCopy from "@/components/HeroCopy";
import HeroVideo from "@/components/HeroVideo";
import UseCaseCard from "@/components/UseCaseCard";
import { SiteFooter } from "@/components/SiteFooter";
import { getPseoPagesByType } from "@/lib/pseo";
import { getSiteOrigin } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rendivia - Programmatic video generation for SaaS products",
  description:
    "Generate deterministic, branded videos from structured data using a simple API.",
  openGraph: {
    title: "Rendivia - Programmatic video generation for SaaS products",
    description:
      "Generate deterministic, branded videos from structured data using a simple API.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Rendivia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rendivia - Programmatic video generation for SaaS products",
    description:
      "Generate deterministic, branded videos from structured data using a simple API.",
    images: ["/og.svg"],
  },
};

const PROBLEM_BULLETS = [
  "PDF exports land in inboxes, not product workflows.",
  "Dashboards require manual interpretation to reach users.",
  "Email reports arrive late or get ignored.",
  "Manual video updates don't scale with customers.",
];

const SOLUTION_COLUMNS = [
  {
    title: "Input",
    body: "Structured JSON from your product data, metrics, or events.",
  },
  {
    title: "Engine",
    body: "Deterministic Remotion templates rendered asynchronously with webhooks.",
  },
  {
    title: "Output",
    body: "A branded MP4 video ready for in-app, email, or portal delivery.",
  },
];

const FEATURES = [
  {
    title: "API-first rendering",
    description: "POST JSON, queue the job, receive a webhook with the MP4 URL.",
  },
  {
    title: "Deterministic output",
    description: "Same input always yields the same video. No randomness, no drift.",
  },
  {
    title: "Code-defined templates",
    description: "Versioned Remotion compositions keep output stable at scale.",
  },
  {
    title: "Brand profiles",
    description: "Apply logo, colors, and fonts automatically per customer.",
  },
  {
    title: "Scalable rendering",
    description: "Queue-based workers with retries, timeouts, and concurrency control.",
  },
  {
    title: "Usage-based billing",
    description: "Meter renders, duration, and resolution to align price with value.",
  },
];

const HOW_IT_WORKS_COMPACT = [
  {
    title: "Send data",
    body: "POST structured JSON to /render.",
  },
  {
    title: "Render asynchronously",
    body: "Deterministic templates, queued at scale.",
  },
  {
    title: "Deliver video",
    body: "Receive MP4 via webhook.",
  },
];

const PRICING_TEASER = [
  {
    name: "Starter",
    price: "$99/mo",
    detail: "500 renders",
  },
  {
    name: "Growth",
    price: "$299/mo",
    detail: "2,500 renders",
  },
  {
    name: "Scale",
    price: "$999/mo",
    detail: "10,000 renders",
  },
];

const API_SNIPPET = `POST /render
{
  "template": "weekly-summary-v1",
  "data": {
    "users": 1243,
    "revenue": 8920,
    "growth": "+12%"
  }
}
-> returns branded MP4 video`;

export default function Home() {
  const useCases = getPseoPagesByType("use_case").slice(0, 6);
  const origin = getSiteOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Rendivia",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: origin,
    description:
      "Programmatic video generation for SaaS products. Generate deterministic, branded MP4 videos from structured data using a simple API.",
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "99",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Growth",
        price: "299",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Scale",
        price: "999",
        priceCurrency: "USD",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <HeroCopy />
          <div className="space-y-6">
            <CodeBlock code={API_SNIPPET} />
          </div>
        </div>
      </section>

      <section className="surface-muted border-t border-zinc-200 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="pill">Static demo (generated via API)</p>
          <div className="mt-6">
            <HeroVideo
              className="surface-card overflow-hidden"
              mp4Src="/landing/rendivia-landing-1080p.mp4"
              webmSrc="/landing/rendivia-landing-1080p.webm"
              poster="/landing/rendivia-landing-poster.svg"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-secondary)]">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
                Three steps from JSON to MP4
              </h2>
            </div>
            <Link
              href="/docs"
              className="touch-target text-sm font-semibold text-[var(--accent-secondary)] hover:underline"
            >
              View API docs
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_IT_WORKS_COMPACT.map((step) => (
              <div key={step.title} className="surface-card p-5">
                <h3 className="text-sm font-semibold text-zinc-900">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{step.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm font-semibold text-zinc-600">
            Built for production workflows. Deterministic output. Versioned templates.
          </p>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[var(--muted-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Problem
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
                Manual reporting breaks at scale
              </h2>
              <p className="mt-3 text-sm text-zinc-600">
                PDFs, emails, and dashboards don’t reach users reliably.
              </p>
            </div>
            <ul className="grid gap-3 text-sm text-zinc-600">
              {PROBLEM_BULLETS.map((bullet) => (
                <li key={bullet} className="surface-card p-4">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Solution
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
            An API that turns data into video
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SOLUTION_COLUMNS.map((column) => (
              <div key={column.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {column.title}
                </p>
                <p className="mt-3 text-sm text-zinc-600">{column.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[var(--muted-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Key features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
            Infrastructure built for deterministic output
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600">
            Rendivia is the backend for product teams that need predictable, branded videos from structured data.
          </p>
          <div className="mt-8">
            <FeatureGrid features={FEATURES} />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Use cases
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
                High-intent pages for real buyers
              </h2>
            </div>
            <Link
              href="/use-cases"
              className="touch-target text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Browse all use cases
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600">
                Add JSON pages to /content/pseo/use-cases to populate this grid.
              </div>
            ) : (
              useCases.map((page) => (
                <UseCaseCard
                  key={page.canonicalUrl}
                  title={page.title}
                  description={page.hero.subheadline}
                  href={page.canonicalUrl}
                />
              ))
            )}
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
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                Pricing
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
                Usage-based pricing for API renders
              </h2>
            </div>
            <Link
              href="/pricing"
              className="touch-target text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              View pricing
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PRICING_TEASER.map((tier) => (
              <div key={tier.name} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{tier.name}</p>
                <p className="mt-3 text-2xl font-semibold text-zinc-900">{tier.price}</p>
                <p className="mt-2 text-sm text-zinc-600">{tier.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[var(--muted-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              Design partner program
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              Work with us on your first deterministic video workflow
            </h2>
            <p className="mt-4 text-sm text-zinc-600">
              We are onboarding a small cohort of SaaS teams building automated reports, audits, and
              customer updates. Design partners get template help, priority support, and roadmap input.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-zinc-600">
              <li>• Custom template guidance for your data</li>
              <li>• Direct access to the product team</li>
              <li>• Early access to new templates and features</li>
            </ul>
          </div>
          <EarlyAccessForm cohort="design-partner" source="home" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
