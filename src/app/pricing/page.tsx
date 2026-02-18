import Link from "next/link";
import type { Metadata } from "next";
import PricingRoiCalculator from "@/components/PricingRoiCalculator";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Rendivia Pricing - Programmatic Video Generation API",
  description:
    "Usage-based pricing for deterministic JSON-to-video rendering. Choose a plan based on render volume.",
  openGraph: {
    title: "Rendivia Pricing - Programmatic Video Generation API",
    description:
      "Usage-based pricing for deterministic JSON-to-video rendering. Choose a plan based on render volume.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Rendivia Pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rendivia Pricing - Programmatic Video Generation API",
    description:
      "Usage-based pricing for deterministic JSON-to-video rendering. Choose a plan based on render volume.",
    images: ["/og.svg"],
  },
};

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "$99/mo",
    includes: "500 renders",
    features: [
      "1 template",
      "Webhook delivery",
      "Brand profiles",
      "Async rendering",
    ],
  },
  {
    name: "Growth",
    price: "$299/mo",
    includes: "2,500 renders",
    features: [
      "Up to 3 templates",
      "Webhooks + polling",
      "Brand profiles",
      "Priority queue",
    ],
  },
  {
    name: "Scale",
    price: "$999/mo",
    includes: "10,000 renders",
    features: [
      "Unlimited templates",
      "Dedicated concurrency",
      "Advanced monitoring",
      "Usage-based overages",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    includes: "Custom volume",
    features: [
      "Custom SLA",
      "Dedicated support",
      "Private rendering capacity",
      "Security review + SSO",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Pricing", href: "/pricing" },
        ]}
      />
      <section className="px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Pricing
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl title-animate">
            Usage-based pricing for API renders
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Choose a plan based on render volume. Deterministic output, branded MP4s, and webhooks included.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500">
            <span>Overages: $0.02 per render</span>
            <span>|</span>
            <Link href="/docs" className="hover:text-zinc-700">
              View docs
            </Link>
          </div>
        </div>
      </section>

      <section className="surface-muted border-t border-zinc-200 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_TIERS.map((tier) => (
              <div key={tier.name} className="surface-card flex h-full flex-col p-6">
                <p className="text-sm font-semibold text-zinc-900">{tier.name}</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-900">{tier.price}</p>
                <p className="mt-1 text-sm text-zinc-500">{tier.includes}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-zinc-600">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link
                  href={tier.name === "Enterprise" ? "/enterprise" : "/dashboard"}
                  className="touch-target mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)]"
                >
                  {tier.name === "Enterprise" ? "Contact sales" : "Get API key"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              ROI
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              Estimate cost savings vs manual video production
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              Use this quick calculator to estimate monthly savings based on your render volume and
              manual production cost. It uses the current plan pricing and overage rates.
            </p>
          </div>
          <PricingRoiCalculator />
        </div>
      </section>

      <section className="border-t border-zinc-200 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="surface-card p-6">
            <h2 className="text-lg font-semibold text-zinc-900">How billing works</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              <li>Renders are metered per completed MP4 output.</li>
              <li>Render limits reset each billing cycle.</li>
              <li>Overages apply only when you exceed plan volume.</li>
            </ul>
          </div>
          <div className="surface-card p-6">
            <h2 className="text-lg font-semibold text-zinc-900">What is included</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              <li>Deterministic Remotion templates.</li>
              <li>Webhook delivery with signed payloads.</li>
              <li>Brand profiles for logo, colors, and fonts.</li>
              <li>Queue-based rendering with retries.</li>
            </ul>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
