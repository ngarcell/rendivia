import type { ComparisonEntry, ComparisonHubEntry } from "./types";
import { competitors } from "./competitors";
import { buildComparisonEntry, type ComparisonSeed } from "./templates";

const seeds: ComparisonSeed[] = [
  {
    competitorSlug: "capcut",
    summary: "Compare Rendivia vs CapCut for clip creation, caption quality, and short-form exports.",
    intro:
      "CapCut is a popular short-form editor with templates and effects, while Rendivia focuses on turning long-form into short clips with brand-consistent captions. If clip production is your bottleneck, Rendivia is streamlined; CapCut is better for broad editing and effects.",
    competitorPros: [
      "Large template library and effects for social videos.",
      "Strong mobile and desktop editing workflows.",
      "Good choice for creators who want an all-in-one editor.",
    ],
    competitorCons: [
      "Caption styling may require more manual tweaks to stay on-brand.",
      "Batch automation and API workflows are limited.",
    ],
    competitorBestFor: [
      "Creators who want a full editor with effects.",
      "Teams editing clips end-to-end in one tool.",
      "Workflows that prioritize templates over caption automation.",
    ],
  },
  {
    competitorSlug: "descript",
    summary: "Rendivia vs Descript: choose between clip-first speed and text-based editing depth.",
    intro:
      "Descript is a text-based editor for podcasts and videos. Rendivia is built for turning long-form into short clips with captions. If you need deep editing and collaboration, Descript is strong. If your bottleneck is clip volume, Rendivia is the faster path.",
    competitorPros: [
      "Powerful text-based editing for podcasts and long-form video.",
      "Collaboration features for teams.",
      "Good for transcript-heavy workflows.",
    ],
    competitorCons: [
      "Short-form caption output can require extra steps.",
      "Batch captioning workflows are less focused than Rendivia.",
    ],
    competitorBestFor: [
      "Podcasters and long-form editors.",
      "Teams that prioritize collaboration and revisions.",
      "Workflows centered on transcript editing.",
    ],
  },
  {
    competitorSlug: "veed",
    summary: "Rendivia vs VEED: compare clip automation and browser-based editing.",
    intro:
      "VEED is a browser-based editor with subtitles and templates. Rendivia specializes in clip creation and brand-consistent captions for short-form. Choose Rendivia for clip-first speed; choose VEED for general editing plus subtitles.",
    competitorPros: [
      "Browser-based editing with templates.",
      "Subtitle tools bundled with a general editor.",
      "Easy for non-technical teams to start quickly.",
    ],
    competitorCons: [
      "Caption consistency can vary between projects.",
      "Automation and batch workflows may be limited.",
    ],
    competitorBestFor: [
      "Teams needing a general browser editor.",
      "Creators who want templates and subtitles together.",
      "One-off edits rather than batch captioning.",
    ],
  },
  {
    competitorSlug: "opus-clip",
    summary: "Rendivia vs Opus Clip: clip generation vs caption-first workflows.",
    intro:
      "Opus Clip focuses on turning long videos into clips. Rendivia focuses on clip creation plus polished captions and brand consistency. If you need clip selection with captions in one workflow, Rendivia is a strong fit.",
    competitorPros: [
      "Strong for finding short clips from long-form content.",
      "Good for repurposing podcast or webinar footage.",
      "Built around AI clip discovery.",
    ],
    competitorCons: [
      "Caption styling may be secondary to clip generation.",
      "Brand presets are not the primary focus.",
    ],
    competitorBestFor: [
      "Teams repurposing long-form content into clips.",
      "Creators who need help selecting highlights.",
      "Workflows where clip discovery is the bottleneck.",
    ],
  },
  {
    competitorSlug: "kapwing",
    summary: "Rendivia vs Kapwing: clip speed vs collaborative editing.",
    intro:
      "Kapwing offers a collaborative browser editor with templates and captions. Rendivia is focused on fast clip output and brand-consistent captions. Choose Kapwing for broad editing; choose Rendivia for clip-focused production at scale.",
    competitorPros: [
      "Collaboration-friendly editor for teams.",
      "Templates and general editing tools included.",
      "Good for simple edits and social assets.",
    ],
    competitorCons: [
      "Caption workflows can be slower than a dedicated pipeline.",
      "Brand consistency takes more manual effort.",
    ],
    competitorBestFor: [
      "Teams that want a general-purpose browser editor.",
      "Creators doing light edits and social graphics.",
      "Projects that need collaboration features.",
    ],
  },
  {
    competitorSlug: "riverside",
    summary: "Rendivia vs Riverside: recording workflows vs caption-first delivery.",
    intro:
      "Riverside excels at remote recording and provides editing tools. Rendivia is built for short-form clip delivery with captions. If recording quality is your priority, Riverside is strong; if clip output is the priority, Rendivia wins on speed and consistency.",
    competitorPros: [
      "High-quality remote recording.",
      "Useful for podcast and interview workflows.",
      "Built-in editing and transcription tools.",
    ],
    competitorCons: [
      "Caption-first workflows are not the primary focus.",
      "Short-form batch exports may require extra steps.",
    ],
    competitorBestFor: [
      "Teams recording podcasts or interviews remotely.",
      "Creators who need studio-quality recordings.",
      "Workflows where recording is the main challenge.",
    ],
  },
];

const competitorMap = new Map(competitors.map((c) => [c.slug, c]));

const built: ComparisonEntry[] = seeds.map((seed) => {
  const competitor = competitorMap.get(seed.competitorSlug);
  if (!competitor) {
    throw new Error(`Unknown competitor slug: ${seed.competitorSlug}`);
  }
  return buildComparisonEntry(seed, competitor);
});

const slugs = built.map((entry) => entry.slug);
const comparisons = built.map((entry) => {
  if (entry.related.length > 0) return entry;
  const related = slugs.filter((slug) => slug !== entry.slug).slice(0, 6);
  return { ...entry, related };
});

export { comparisons };

export function getComparisonEntry(slug: string): ComparisonEntry | null {
  return comparisons.find((entry) => entry.slug === slug) ?? null;
}

export function getComparisonSlugs(limit?: number): string[] {
  const all = comparisons.map((entry) => entry.slug);
  return typeof limit === "number" ? all.slice(0, limit) : all;
}

export function getComparisonHubEntries(): ComparisonHubEntry[] {
  return comparisons.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    competitorName: entry.competitor.name,
    category: entry.competitor.category,
  }));
}

export function getRelatedComparisons(slug: string, limit = 6): ComparisonHubEntry[] {
  const entry = getComparisonEntry(slug);
  if (!entry) return [];
  return entry.related
    .map((relatedSlug) => getComparisonEntry(relatedSlug))
    .filter((item): item is ComparisonEntry => Boolean(item))
    .slice(0, limit)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      competitorName: item.competitor.name,
      category: item.competitor.category,
    }));
}
