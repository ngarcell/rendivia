"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import TrackedLink from "@/components/TrackedLink";
import { trackEvent } from "@/lib/analytics";

type VariantKey = "A" | "B";

type HeroVariant = {
  eyebrow: string;
  subheadline: string;
  support: string;
};

const HERO_HEADLINE = "Programmatic video generation for SaaS products";

const HERO_VARIANTS: Record<VariantKey, HeroVariant> = {
  A: {
    eyebrow: "Developer-first video infrastructure",
    subheadline: "Generate deterministic, branded videos from structured data using a simple API.",
    support: "Turn reports, metrics, events, and summaries into MP4 videos - automatically.",
  },
  B: {
    eyebrow: "Deterministic video infrastructure",
    subheadline: "Ship branded MP4s from structured data without building video infrastructure.",
    support: "Automate weekly reports, audits, and product updates with stable templates.",
  },
};

const CTA_VARIANTS: Record<VariantKey, string> = {
  A: "Get API key",
  B: "Get API access",
};

const SECONDARY_CTA_LABEL = "View API docs";

const STORAGE_KEY = "rendivia_ab_hero_v1";

type AssignedVariants = { hero: VariantKey; cta: VariantKey };

const withDelay = (ms: number): CSSProperties => ({ "--delay": `${ms}ms` } as CSSProperties);

function assignVariants(): AssignedVariants {
  if (typeof window === "undefined") {
    return { hero: "A", cta: "A" };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { hero?: VariantKey; cta?: VariantKey };
      return {
        hero: parsed.hero === "B" ? "B" : "A",
        cta: parsed.cta === "B" ? "B" : "A",
      };
    }
  } catch {
    // Ignore malformed storage values and fall back to random assignment.
  }

  const next: AssignedVariants = {
    hero: Math.random() < 0.5 ? "A" : "B",
    cta: Math.random() < 0.5 ? "A" : "B",
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors (private mode, quota limits, etc.)
  }

  return next;
}

export default function HeroCopy() {
  const [assigned] = useState<AssignedVariants>(() => assignVariants());
  const heroVariant = assigned.hero;
  const ctaVariant = assigned.cta;

  useEffect(() => {
    trackEvent("ab_assign", { test: "hero_copy_v1", variant: heroVariant });
    trackEvent("ab_assign", { test: "hero_cta_text_v1", variant: ctaVariant });
  }, [heroVariant, ctaVariant]);

  const hero = HERO_VARIANTS[heroVariant];
  const ctaLabel = CTA_VARIANTS[ctaVariant];

  return (
    <div className="hero-sequence">
      <p
        className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]"
        style={withDelay(0)}
      >
        {hero.eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl" style={withDelay(140)}>
        {HERO_HEADLINE}
      </h1>
      <p className="mt-4 text-lg text-zinc-600" style={withDelay(280)}>
        {hero.subheadline}
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-600" style={withDelay(340)}>
        Not a video editor. No timelines. No drag-and-drop.
      </p>
      <p className="mt-2 text-sm text-zinc-500" style={withDelay(420)}>
        {hero.support}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3" style={withDelay(560)}>
        <TrackedLink
          href="/dashboard"
          eventName="cta_get_api_key"
          eventProps={{ location: "home_hero", heroVariant, ctaVariant }}
          className="touch-target inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)]"
        >
          {ctaLabel}
        </TrackedLink>
        <TrackedLink
          href="/docs"
          eventName="cta_view_docs"
          eventProps={{ location: "home_hero", heroVariant, ctaVariant }}
          className="touch-target text-sm font-semibold text-[var(--accent-secondary)] hover:underline"
        >
          {SECONDARY_CTA_LABEL}
        </TrackedLink>
      </div>
    </div>
  );
}
