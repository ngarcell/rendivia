import type { CompetitorEntry } from "./types";

export const competitors: CompetitorEntry[] = [
  {
    slug: "capcut",
    name: "CapCut",
    category: "Short-form video editor",
    homepage: "https://www.capcut.com",
    shortDescription: "Popular all-in-one editor with templates and effects for short-form videos.",
  },
  {
    slug: "descript",
    name: "Descript",
    category: "Podcast and video editor",
    homepage: "https://www.descript.com",
    shortDescription: "Text-based editing for podcasts and videos with collaboration features.",
  },
  {
    slug: "veed",
    name: "VEED",
    category: "Online video editor",
    homepage: "https://www.veed.io",
    shortDescription: "Browser-based editor with subtitles, templates, and brand kits.",
  },
  {
    slug: "opus-clip",
    name: "Opus Clip",
    category: "Clip repurposing",
    homepage: "https://www.opus.pro",
    shortDescription: "AI-powered repurposing tool focused on turning long videos into clips.",
  },
  {
    slug: "kapwing",
    name: "Kapwing",
    category: "Online editor",
    homepage: "https://www.kapwing.com",
    shortDescription: "Collaborative video editor with templates and captioning tools.",
  },
  {
    slug: "riverside",
    name: "Riverside",
    category: "Recording + editing",
    homepage: "https://riverside.fm",
    shortDescription: "Remote recording platform with editing and transcription tools.",
  },
  {
    slug: "happy-scribe",
    name: "Happy Scribe",
    category: "Transcription + subtitles",
    homepage: "https://www.happyscribe.com",
    shortDescription: "Transcription and subtitle workflows for teams and multilingual content.",
  },
  {
    slug: "zubtitle",
    name: "Zubtitle",
    category: "Captioning",
    homepage: "https://zubtitle.com",
    shortDescription: "Captioning and branding overlays for social videos.",
  },
];

export function getCompetitorBySlug(slug: string): CompetitorEntry | null {
  return competitors.find((entry) => entry.slug === slug) ?? null;
}
