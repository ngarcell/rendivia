import type { CompetitorEntry, ComparisonEntry, FeatureRow, SeoFaq } from "./types";

const PRODUCT_NAME = "Rendivia";

export interface ComparisonSeed {
  competitorSlug: string;
  summary?: string;
  intro?: string;
  whyRendivia?: string[];
  featureMatrix?: FeatureRow[];
  rendiviaPros?: string[];
  rendiviaCons?: string[];
  competitorPros?: string[];
  competitorCons?: string[];
  pricingNote?: string;
  rendiviaBestFor?: string[];
  competitorBestFor?: string[];
  faqs?: SeoFaq[];
  related?: string[];
}

export function buildDefaultWhyRendivia(): string[] {
  return [
    `Clip suggestions that turn long-form into short-form fast.`,
    `Brand-consistent captions and typography across every export.`,
    `Word-level timing with Whisper and Remotion for polished captions.`,
    `Built for batch processing with API access and presets.`,
  ];
}

export function buildDefaultFeatureMatrix(): FeatureRow[] {
  return [
    {
      feature: "Word-level caption timing",
      rendivia: "Yes (Whisper + Remotion)",
      competitor: "Varies",
    },
    {
      feature: "Brand presets & style controls",
      rendivia: "Yes (brand presets + URL import)",
      competitor: "Varies",
    },
    {
      feature: "Clip suggestions from long-form",
      rendivia: "Yes",
      competitor: "Varies",
    },
    {
      feature: "Batch processing",
      rendivia: "Yes (API + queue)",
      competitor: "Varies",
    },
    {
      feature: "Short-form focus",
      rendivia: "Optimized for Shorts/Reels/TikTok",
      competitor: "Varies",
    },
    {
      feature: "Export ready MP4",
      rendivia: "Yes",
      competitor: "Yes",
    },
    {
      feature: "Trim silence / pacing tools",
      rendivia: "Pro and above",
      competitor: "Varies",
    },
  ];
}

export function buildDefaultRendiviaPros(): string[] {
  return [
    "Fast clip-to-export workflow for short-form.",
    "Consistent brand styling across every clip.",
    "Caption editing and word-level timing.",
    "API and batch workflows for teams.",
  ];
}

export function buildDefaultRendiviaCons(): string[] {
  return [
    "Best fit for clip production and captions, not full-scale editing.",
    "Advanced effects or multi-track edits require other tools.",
  ];
}

export function buildDefaultCompetitorPros(competitor: CompetitorEntry): string[] {
  return [
    `${competitor.name} is popular for its ${competitor.category.toLowerCase()} workflow.`,
    "Often includes templates or editing tools beyond captions.",
    "Good choice for creators who want an all-in-one editor.",
  ];
}

export function buildDefaultCompetitorCons(): string[] {
  return [
    "Brand consistency can take extra manual setup.",
    "Batch workflows and automation may be limited or premium.",
  ];
}

export function buildDefaultUseCases(competitor: CompetitorEntry) {
  return {
    rendivia: [
      "Teams turning webinars and demos into clips.",
      "Agencies producing short-form content at scale.",
      "Marketing teams needing fast clip output with captions.",
    ],
    competitor: [
      `Creators who want broader editing tools in ${competitor.name}.`,
      "Teams that need templates, effects, or timeline editing.",
      "Workflows where editing depth matters more than speed.",
    ],
  };
}

export function buildDefaultFaqs(competitorName: string): SeoFaq[] {
  return [
    {
      question: `Is ${PRODUCT_NAME} or ${competitorName} better for short-form clips?`,
      answer: `${PRODUCT_NAME} focuses on turning long-form into short clips with captions and presets. ${competitorName} can be a better fit if you need broader editing tools.`,
    },
    {
      question: `Does ${PRODUCT_NAME} support brand styling?`,
      answer: `Yes. ${PRODUCT_NAME} supports brand presets and brand-from-URL to keep captions consistent across every export.`,
    },
    {
      question: `Can I batch render clips with ${PRODUCT_NAME}?`,
      answer: `Yes. Pro and above include API access and batch workflows so you can process many clips at once.`,
    },
    {
      question: `Do I still need a video editor?`,
      answer: `${PRODUCT_NAME} handles clip selection, captions, and short-form finishing. If you need heavy effects, you may still use an editor alongside it.`,
    },
    {
      question: `How accurate are the captions?`,
      answer: `${PRODUCT_NAME} uses Whisper for transcription with word-level timing, then renders captions with Remotion for accuracy and polish.`,
    },
    {
      question: `Can I export for YouTube Shorts, Reels, and TikTok?`,
      answer: `Yes. ${PRODUCT_NAME} renders 9:16 exports ready for Shorts, Reels, and TikTok workflows.`,
    },
  ];
}

export function buildComparisonEntry(seed: ComparisonSeed, competitor: CompetitorEntry): ComparisonEntry {
  const title = `Rendivia vs ${competitor.name}`;
  const primaryKeyword = `rendivia vs ${competitor.name}`.toLowerCase();
  const summary =
    seed.summary ??
    `${PRODUCT_NAME} vs ${competitor.name}: compare clip creation, caption quality, and short-form output for your team.`;
  const intro =
    seed.intro ??
    `${PRODUCT_NAME} and ${competitor.name} both help teams ship short-form videos, but they solve different parts of the workflow. ${PRODUCT_NAME} is built for turning long-form into short clips with brand-consistent captions, while ${competitor.name} emphasizes broader editing capabilities. Use this comparison to pick the right fit for your pipeline.`;

  const whyRendivia = seed.whyRendivia ?? buildDefaultWhyRendivia();
  const featureMatrix = seed.featureMatrix ?? buildDefaultFeatureMatrix();
  const pros = {
    rendivia: seed.rendiviaPros ?? buildDefaultRendiviaPros(),
    competitor: seed.competitorPros ?? buildDefaultCompetitorPros(competitor),
  };
  const cons = {
    rendivia: seed.rendiviaCons ?? buildDefaultRendiviaCons(),
    competitor: seed.competitorCons ?? buildDefaultCompetitorCons(),
  };
  const useCases = seed.rendiviaBestFor || seed.competitorBestFor
    ? {
        rendivia: seed.rendiviaBestFor ?? buildDefaultUseCases(competitor).rendivia,
        competitor: seed.competitorBestFor ?? buildDefaultUseCases(competitor).competitor,
      }
    : buildDefaultUseCases(competitor);

  const faqs = seed.faqs ?? buildDefaultFaqs(competitor.name);

  return {
    slug: `rendivia-vs-${competitor.slug}`,
    title,
    primaryKeyword,
    summary,
    intro,
    competitor,
    whyRendivia,
    featureMatrix,
    pros,
    cons,
    pricingNote:
      seed.pricingNote ??
      `Pricing and feature availability change frequently. Check ${competitor.name} and ${PRODUCT_NAME} sites for the latest details.`,
    useCases,
    faqs,
    related: seed.related ?? [],
  };
}
