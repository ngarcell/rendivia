/**
 * Single source of truth for Tools PSEO: platforms, languages, use cases, features, verticals, platform-language.
 * Used by hub and /tools/[category]/[slug] for category-based URLs and rich page content.
 */

import {
  getPlatformLanguageEntry,
  getAllPlatformLanguageSlugs,
  getPlatformLanguageHubEntries,
} from "./tools-platform-language";

export type ToolCategory = "platform" | "language" | "use-case" | "feature" | "vertical" | "platform-language";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolEntry {
  slug: string;
  name: string;
  primaryKeyword: string;
  description: string;
  intro: string;
  benefits: string[];
  faqs: ToolFaq[];
  howToSteps: string[];
  cta: string;
}

const platformEntries: ToolEntry[] = [
  {
    slug: "youtube-shorts-captions",
    name: "YouTube Shorts",
    primaryKeyword: "add captions to youtube shorts",
    description: "Turn webinars and demos into YouTube Shorts with captions and brand presets. Upload long-form, pick clips, render Shorts.",
    intro: "YouTube Shorts work best when the message is tight and the captions are readable. Rendivia turns long-form content into Shorts by transcribing with Whisper, suggesting clip segments, and rendering brand-consistent captions with Remotion.",
    benefits: [
      "Auto-suggest clip segments from long-form content",
      "Word-level captions that match your brand typography and colors",
      "9:16 exports ready for Shorts",
      "API and batch export for teams",
    ],
    faqs: [
      { question: "How do I turn a webinar into YouTube Shorts?", answer: "Upload the full webinar to Rendivia, review the auto-suggested clip segments, and render the selected Shorts with brand captions." },
      { question: "Can I keep my brand style consistent across Shorts?", answer: "Yes. Save a brand preset so every Short uses the same font, colors, and caption style." },
      { question: "Does Rendivia export 9:16 for Shorts?", answer: "Yes. Shorts export in 1080×1920 by default and can be switched to 1:1 or 16:9 as needed." },
    ],
    howToSteps: [
      "Upload your long-form video to Rendivia.",
      "Review clip suggestions and adjust the transcript if needed.",
      "Apply your brand preset and aspect ratio.",
      "Render and download Shorts-ready MP4s.",
    ],
    cta: "Create YouTube Shorts",
  },
  {
    slug: "tiktok-caption-generator",
    name: "TikTok",
    primaryKeyword: "tiktok caption generator",
    description: "Turn long-form into TikTok clips with captions and presets. Trim, caption, and render in one flow.",
    intro: "TikTok thrives on fast, focused clips. Rendivia helps B2B teams turn webinars and demos into TikTok-ready clips by suggesting segments, letting you edit transcripts, and rendering captions with consistent brand styling.",
    benefits: [
      "Auto-suggested clip segments from long videos",
      "Word-level captions with brand-consistent styling",
      "9:16 exports optimized for TikTok",
      "API access for bulk workflows",
    ],
    faqs: [
      { question: "How do I turn a long video into TikTok clips?", answer: "Upload the full video, select clip suggestions, then render TikTok clips with captions and brand styling." },
      { question: "Can I customize TikTok captions?", answer: "Yes. Choose fonts, sizes, colors, and positioning with brand presets." },
    ],
    howToSteps: [
      "Upload a webinar, demo, or podcast video.",
      "Review clip suggestions and adjust transcript text.",
      "Apply a brand preset and render.",
      "Download and post to TikTok.",
    ],
    cta: "Create TikTok clips",
  },
  {
    slug: "instagram-reels-captions",
    name: "Instagram Reels",
    primaryKeyword: "instagram reels subtitle tool",
    description: "Convert long-form into Reels with brand captions. Fast clip selection and 9:16 exports.",
    intro: "Reels perform best when the story is concise and captions are readable. Rendivia helps you clip long videos, edit transcripts, and render Reels with brand-consistent captions.",
    benefits: [
      "Auto-suggested clips for quick Reels creation",
      "Word-level captions that match your brand",
      "9:16 exports ready for Instagram",
      "Consistent styling across all short-form platforms",
    ],
    faqs: [
      { question: "Can I create Reels from a webinar?", answer: "Yes. Upload the full webinar, select clip suggestions, and render Reels with captions." },
      { question: "Do Reels keep the same brand style as Shorts and TikTok?", answer: "Yes. Presets apply across all exports so your style is consistent." },
    ],
    howToSteps: [
      "Upload your long-form video to Rendivia.",
      "Pick or refine clip suggestions.",
      "Apply your preset and render Reels.",
      "Download and publish to Instagram.",
    ],
    cta: "Create Instagram Reels",
  },
  {
    slug: "facebook-reels-captions",
    name: "Facebook Reels",
    primaryKeyword: "facebook reels captions",
    description: "Clip long-form content into Facebook Reels with captions and brand presets.",
    intro: "Facebook Reels are faster to produce when clip selection and captioning are automated. Rendivia suggests clip segments, lets you edit transcripts, and renders Reels with brand-consistent captions.",
    benefits: [
      "Auto-suggested clips from long videos",
      "Brand-consistent captions rendered with Remotion",
      "Batch exports for teams and agencies",
      "Same workflow across short-form platforms",
    ],
    faqs: [
      { question: "How do I create Facebook Reels from a demo?", answer: "Upload the demo, select clip suggestions, and render captioned Reels." },
      { question: "Can I process many Reels at once?", answer: "Yes. Pro+ includes batch workflows and API access." },
    ],
    howToSteps: [
      "Upload a long-form video to Rendivia.",
      "Select clips and apply your brand preset.",
      "Render the Reels.",
      "Download and publish to Facebook.",
    ],
    cta: "Create Facebook Reels",
  },
];

const languageEntries: ToolEntry[] = [
  {
    slug: "spanish-subtitles",
    name: "Spanish",
    primaryKeyword: "spanish subtitle generator for video",
    description: "Generate Spanish captions for short clips from long-form content. Brand presets included.",
    intro: "Spanish captions help B2B teams reach broader audiences. Rendivia transcribes Spanish with Whisper, then renders brand-consistent captions for clips derived from long videos.",
    benefits: [
      "Spanish transcription with word-level timing",
      "Brand-consistent caption styling",
      "Clip selection from long-form content",
      "Same workflow for 48 languages",
    ],
    faqs: [
      { question: "How do I create Spanish captions for Shorts?", answer: "Upload your long-form video, choose Spanish, and render the selected clips with captions." },
      { question: "Can I render multiple languages?", answer: "Yes. Render once per language using the same clip selections." },
    ],
    howToSteps: [
      "Upload your long-form video to Rendivia.",
      "Select Spanish or auto-detect.",
      "Pick clips and apply your preset.",
      "Render and download Spanish-captioned MP4s.",
    ],
    cta: "Spanish captions",
  },
  {
    slug: "french-subtitles",
    name: "French",
    primaryKeyword: "french auto captions",
    description: "French captions for short clips with brand presets and word-level timing.",
    intro: "French captions make your clips accessible and shareable. Rendivia transcribes French and renders on-brand captions for short-form exports.",
    benefits: [
      "Accurate French transcription",
      "Word-level captions with brand styling",
      "Clip-based exports for short-form platforms",
      "Same pipeline for 48 languages",
    ],
    faqs: [
      { question: "How do I create French captions for Reels?", answer: "Upload your video, choose French, select clips, and render with your brand preset." },
      { question: "Can I reuse my brand style for French captions?", answer: "Yes. Presets apply across languages so your look stays consistent." },
    ],
    howToSteps: [
      "Upload your long-form video.",
      "Pick French and select clips.",
      "Apply your brand preset.",
      "Render and download the French-captioned MP4s.",
    ],
    cta: "French captions for clips",
  },
  {
    slug: "german-subtitles",
    name: "German",
    primaryKeyword: "german subtitle generator",
    description: "German captions for short clips, optimized for TikTok, Reels, and Shorts.",
    intro: "German captions help you reach German-speaking viewers on short-form platforms. Rendivia transcribes German and renders captions with your brand style.",
    benefits: [
      "German transcription and word-level captions",
      "Clip-based exports from long-form content",
      "Brand-consistent styling for German clips",
      "API and batch workflows for teams",
    ],
    faqs: [
      { question: "How do I generate German captions for Shorts?", answer: "Upload your long-form video, choose German, select clip segments, and render." },
      { question: "Does Rendivia support other languages?", answer: "Yes. You can render the same clips in other languages by re-running the render per language." },
    ],
    howToSteps: [
      "Upload your long-form video.",
      "Select German or auto-detect.",
      "Pick clips and apply your preset.",
      "Render and download German-captioned clips.",
    ],
    cta: "German captions",
  },
];

const useCaseEntries: ToolEntry[] = [
  {
    slug: "podcast-to-shorts",
    name: "Podcast to Shorts",
    primaryKeyword: "podcast to short form",
    description: "Turn podcasts into Shorts with clip suggestions, captions, and brand presets.",
    intro: "Podcasts contain dozens of clip-worthy moments. Rendivia transcribes your episode, suggests clips, and renders captions so each Short is ready to post.",
    benefits: [
      "Clip suggestions from full podcast episodes",
      "Brand-consistent captions for every clip",
      "9:16 exports optimized for Shorts",
      "Batch exports for teams",
    ],
    faqs: [
      { question: "How do I turn a podcast into Shorts?", answer: "Upload the full episode, review clip suggestions, and render the best moments with captions." },
      { question: "Can I keep the same style across all clips?", answer: "Yes. Save a brand preset and apply it across all podcast clips." },
    ],
    howToSteps: [
      "Upload the full podcast episode.",
      "Select clip suggestions and edit transcript text.",
      "Apply your brand preset and render.",
      "Download and post your Shorts.",
    ],
    cta: "Podcast to Shorts",
  },
  {
    slug: "long-to-shorts",
    name: "Long to Shorts",
    primaryKeyword: "long video to shorts in one click",
    description: "Turn long videos into short clips with auto suggestions, captions, and brand presets.",
    intro: "Repurposing long videos into Shorts is manual without tooling. Rendivia transcribes the video, suggests clips, and renders short-form exports with consistent captions.",
    benefits: [
      "Clip suggestions from long-form content",
      "Word-level captions for each clip",
      "9:16 exports for Shorts, Reels, and TikTok",
      "Batch workflows for high volume",
    ],
    faqs: [
      { question: "How do I turn a long video into Shorts?", answer: "Upload the full video, select clip suggestions, and render captioned clips." },
      { question: "Can I edit the transcript before rendering?", answer: "Yes. You can edit the transcript and captions before rendering each clip." },
    ],
    howToSteps: [
      "Upload the long-form video.",
      "Review and select clip suggestions.",
      "Edit transcript text and apply your preset.",
      "Render and download Shorts.",
    ],
    cta: "Long to Shorts",
  },
  {
    slug: "trim-silence-captions",
    name: "Trim & Captions",
    primaryKeyword: "trim silence and add captions",
    description: "Tighten clips and render captions in one flow. Designed for short-form speed.",
    intro: "Tight clips win on short-form. Rendivia suggests trims and renders captions in one flow so you can ship faster.",
    benefits: [
      "Silence-based trim suggestions",
      "Word-level captions aligned to clip timing",
      "One workflow for trim and render",
      "Batch workflows for teams",
    ],
    faqs: [
      { question: "How does trim affect captions?", answer: "Trim suggestions adjust clip timing and captions reflow to keep words in sync." },
      { question: "Can I skip trimming and just caption?", answer: "Yes. You can keep the full clip and render captions only." },
    ],
    howToSteps: [
      "Upload your long-form video.",
      "Review trim suggestions and accept or ignore.",
      "Apply your brand preset and render captions.",
      "Download the finished MP4s.",
    ],
    cta: "Trim & caption",
  },
];

const featureEntries: ToolEntry[] = [
  {
    slug: "animated-captions",
    name: "Animated captions",
    primaryKeyword: "animated captions for video",
    description: "Word-level animated captions for short clips with brand presets.",
    intro: "Animated captions keep attention on short-form content. Rendivia renders word-level captions with your brand fonts and colors.",
    benefits: [
      "Word-level timing optimized for short clips",
      "Brand fonts and colors applied to every clip",
      "Consistent Remotion rendering",
      "Batch workflows for teams",
    ],
    faqs: [
      { question: "What are animated captions?", answer: "Animated captions appear word-by-word in sync with speech. Rendivia renders them using Remotion with your brand style." },
      { question: "Can I customize the animation style?", answer: "The default style is consistent and on-brand. Custom motion styles can be added as advanced templates later." },
    ],
    howToSteps: [
      "Upload a long-form video and select clips.",
      "Apply your brand preset.",
      "Render clips with animated captions.",
      "Download the MP4s.",
    ],
    cta: "Create animated captions",
  },
  {
    slug: "burn-in-subtitles",
    name: "Burn-in subtitles",
    primaryKeyword: "burn-in subtitles for video",
    description: "Burn-in subtitles for short clips with consistent brand styling.",
    intro: "Burn-in subtitles keep captions visible across platforms. Rendivia renders them into each clip so every export is ready to post.",
    benefits: [
      "Always-visible captions in the MP4",
      "Brand-consistent fonts and positioning",
      "Word-level timing from Whisper",
      "Consistent output across short-form platforms",
    ],
    faqs: [
      { question: "What are burn-in subtitles?", answer: "Burn-in subtitles are rendered into the video pixels so they always show. Rendivia generates them during render." },
      { question: "Can I export SRT files instead?", answer: "The MVP focuses on captioned MP4 exports. SRT export can be added later." },
    ],
    howToSteps: [
      "Upload your long-form video and select clips.",
      "Apply your brand preset.",
      "Render burn-in subtitles for each clip.",
      "Download the MP4s.",
    ],
    cta: "Get burn-in subtitles",
  },
  {
    slug: "auto-captions",
    name: "Auto captions",
    primaryKeyword: "auto captions for video",
    description: "Automatic captions for short clips with word-level timing.",
    intro: "Auto captions keep your clips fast to produce. Rendivia transcribes with Whisper and renders captions with Remotion, so you get short-form exports without manual timing.",
    benefits: [
      "Automatic transcription and timing",
      "Word-level accuracy for short-form",
      "Editable transcript before render",
      "Consistent brand styling",
    ],
    faqs: [
      { question: "Do I need to upload a transcript?", answer: "No. Rendivia generates the transcript automatically and lets you edit it before rendering." },
      { question: "Can I use auto captions on clips from long videos?", answer: "Yes. Upload the long video, select clips, and render with auto captions." },
    ],
    howToSteps: [
      "Upload a long-form video.",
      "Select clips and edit transcript text.",
      "Apply your brand preset.",
      "Render and download the MP4s.",
    ],
    cta: "Get auto captions",
  },
];

const verticalEntries: ToolEntry[] = [
  {
    slug: "real-estate-video-captions",
    name: "Real estate",
    primaryKeyword: "video captions for real estate",
    description: "Turn property tours and walkthroughs into short clips with captions and brand presets.",
    intro: "Real estate teams need short clips from property tours that are easy to watch without sound. Rendivia turns tours into short-form clips with captions and brand styling.",
    benefits: [
      "Clip suggestions from long walkthroughs",
      "Brand-consistent captions for listings and ads",
      "9:16 exports for social platforms",
      "Batch workflows for teams",
    ],
    faqs: [
      { question: "Why use captions on real estate clips?", answer: "Many viewers watch without sound. Captions improve watch time and keep your branding consistent." },
      { question: "Can we process many listings at once?", answer: "Yes. Batch workflows and presets support high-volume teams." },
    ],
    howToSteps: [
      "Upload the full walkthrough video.",
      "Select the clip suggestions.",
      "Apply your preset and render.",
      "Download and post the clips.",
    ],
    cta: "Create real estate clips",
  },
  {
    slug: "educators-video-captions",
    name: "Educators",
    primaryKeyword: "video captions for educators",
    description: "Turn lectures into short learning clips with captions and consistent styling.",
    intro: "Short learning clips are easier to share. Rendivia turns lectures into short clips with captions so students can watch anywhere.",
    benefits: [
      "Clip-based exports from long lectures",
      "Word-level captions for clarity",
      "Consistent course styling",
      "Batch workflows for course teams",
    ],
    faqs: [
      { question: "How do I create short lecture clips?", answer: "Upload the lecture, select clip suggestions, and render with captions." },
      { question: "Can I keep one style across all course clips?", answer: "Yes. Use a brand preset for consistent styling." },
    ],
    howToSteps: [
      "Upload the full lecture.",
      "Select the clips you want.",
      "Apply your preset and render.",
      "Download and publish to your LMS or social channels.",
    ],
    cta: "Create learning clips",
  },
  {
    slug: "agencies-video-captions",
    name: "Agencies",
    primaryKeyword: "video captions for agencies",
    description: "Scale clip production for agencies with presets, batch rendering, and API.",
    intro: "Agencies need consistent clip output across clients. Rendivia offers presets, batch rendering, and API workflows for short-form production at scale.",
    benefits: [
      "Brand presets per client",
      "Batch rendering and API workflows",
      "Consistent short-form exports across platforms",
      "Fast iteration for client approvals",
    ],
    faqs: [
      { question: "How do agencies handle multiple clients?", answer: "Create a preset per client and apply it to every clip render." },
      { question: "Can we automate clip rendering?", answer: "Yes. API workflows let you render clips in batch." },
    ],
    howToSteps: [
      "Set up a brand preset for each client.",
      "Upload long-form videos or send via API.",
      "Select clips and render in batch.",
      "Deliver the final MP4s.",
    ],
    cta: "Scale agency clips",
  },
];

export const TOOL_CATEGORIES: ToolCategory[] = ["platform", "language", "use-case", "feature", "vertical", "platform-language"];

const dataByCategory: Record<Exclude<ToolCategory, "platform-language">, ToolEntry[]> = {
  platform: platformEntries,
  language: languageEntries,
  "use-case": useCaseEntries,
  feature: featureEntries,
  vertical: verticalEntries,
};

export function getToolEntry(category: ToolCategory, slug: string): ToolEntry | null {
  if (category === "platform-language") {
    return getPlatformLanguageEntry(slug);
  }
  const entries = dataByCategory[category];
  return entries.find((e) => e.slug === slug) ?? null;
}

export function getAllToolEntriesByCategory(): Record<ToolCategory, ToolEntry[]> {
  return {
    ...dataByCategory,
    "platform-language": getPlatformLanguageHubEntries(),
  };
}

export function getAllSlugsForStaticParams(): { category: ToolCategory; slug: string }[] {
  const result: { category: ToolCategory; slug: string }[] = [];
  for (const category of TOOL_CATEGORIES) {
    if (category === "platform-language") {
      for (const { platformSlug, languageSlug } of getAllPlatformLanguageSlugs()) {
        result.push({ category, slug: `${platformSlug}-${languageSlug}` });
      }
      continue;
    }
    for (const entry of dataByCategory[category]) {
      result.push({ category, slug: entry.slug });
    }
  }
  return result;
}

/** Get related tool entries in the same category (for cross-linking). */
export function getRelatedToolEntries(
  category: ToolCategory,
  currentSlug: string,
  limit: number = 4
): { category: ToolCategory; slug: string; name: string }[] {
  if (category === "platform-language") {
    const hub = getPlatformLanguageHubEntries();
    return hub
      .filter((e) => e.slug !== currentSlug)
      .slice(0, limit)
      .map((e) => ({ category: "platform-language" as const, slug: e.slug, name: e.name }));
  }
  const entries = dataByCategory[category];
  return entries
    .filter((e) => e.slug !== currentSlug)
    .slice(0, limit)
    .map((e) => ({ category, slug: e.slug, name: e.name }));
}

/** Resolve legacy flat slug to category + slug for redirects (e.g. youtube-shorts-captions -> platform). */
export function resolveLegacySlug(flatSlug: string): { category: ToolCategory; slug: string } | null {
  const categoriesWithoutPlatformLang = TOOL_CATEGORIES.filter((c) => c !== "platform-language");
  for (const category of categoriesWithoutPlatformLang) {
    const entry = dataByCategory[category].find((e) => e.slug === flatSlug);
    if (entry) return { category, slug: entry.slug };
  }
  const legacyMap: Record<string, { category: ToolCategory; slug: string }> = {
    "youtube-shorts-captions": { category: "platform", slug: "youtube-shorts-captions" },
    "tiktok-captions": { category: "platform", slug: "tiktok-caption-generator" },
    "instagram-reels-captions": { category: "platform", slug: "instagram-reels-captions" },
    "facebook-reels-captions": { category: "platform", slug: "facebook-reels-captions" },
    "spanish-subtitles": { category: "language", slug: "spanish-subtitles" },
    "french-subtitles": { category: "language", slug: "french-subtitles" },
    "german-subtitles": { category: "language", slug: "german-subtitles" },
    "podcast-to-shorts": { category: "use-case", slug: "podcast-to-shorts" },
    "long-to-shorts": { category: "use-case", slug: "long-to-shorts" },
    "trim-silence-captions": { category: "use-case", slug: "trim-silence-captions" },
  };
  return legacyMap[flatSlug] ?? null;
}
