/**
 * Platform × Language PSEO: 8 platforms × 101 languages = 808 unique pages.
 * Entries are built from templates so each page has unique intro, benefits, FAQs, how-to.
 */

import type { ToolEntry, ToolFaq } from "./tools";

export const PLATFORMS_FOR_LANG: { slug: string; name: string }[] = [
  { slug: "youtube-shorts", name: "YouTube Shorts" },
  { slug: "tiktok", name: "TikTok" },
  { slug: "instagram-reels", name: "Instagram Reels" },
  { slug: "facebook-reels", name: "Facebook Reels" },
  { slug: "linkedin-video", name: "LinkedIn Video" },
  { slug: "twitter-x", name: "X (Twitter)" },
  { slug: "pinterest-video", name: "Pinterest Video" },
  { slug: "snapchat", name: "Snapchat" },
];

// 101 languages (Whisper-supported) for 8×101 = 808 pages. Slug used in URL.
export const LANGUAGES_FOR_PLATFORM: { slug: string; name: string }[] = [
  { slug: "afrikaans", name: "Afrikaans" },
  { slug: "amharic", name: "Amharic" },
  { slug: "arabic", name: "Arabic" },
  { slug: "assamese", name: "Assamese" },
  { slug: "azerbaijani", name: "Azerbaijani" },
  { slug: "bashkir", name: "Bashkir" },
  { slug: "belarusian", name: "Belarusian" },
  { slug: "bengali", name: "Bengali" },
  { slug: "tibetan", name: "Tibetan" },
  { slug: "breton", name: "Breton" },
  { slug: "bosnian", name: "Bosnian" },
  { slug: "catalan", name: "Catalan" },
  { slug: "czech", name: "Czech" },
  { slug: "welsh", name: "Welsh" },
  { slug: "danish", name: "Danish" },
  { slug: "german", name: "German" },
  { slug: "greek", name: "Greek" },
  { slug: "english", name: "English" },
  { slug: "spanish", name: "Spanish" },
  { slug: "estonian", name: "Estonian" },
  { slug: "basque", name: "Basque" },
  { slug: "persian", name: "Persian" },
  { slug: "finnish", name: "Finnish" },
  { slug: "faroese", name: "Faroese" },
  { slug: "french", name: "French" },
  { slug: "galician", name: "Galician" },
  { slug: "gujarati", name: "Gujarati" },
  { slug: "hausa", name: "Hausa" },
  { slug: "hawaiian", name: "Hawaiian" },
  { slug: "hebrew", name: "Hebrew" },
  { slug: "hindi", name: "Hindi" },
  { slug: "croatian", name: "Croatian" },
  { slug: "haitian-creole", name: "Haitian Creole" },
  { slug: "hungarian", name: "Hungarian" },
  { slug: "armenian", name: "Armenian" },
  { slug: "indonesian", name: "Indonesian" },
  { slug: "icelandic", name: "Icelandic" },
  { slug: "italian", name: "Italian" },
  { slug: "japanese", name: "Japanese" },
  { slug: "javanese", name: "Javanese" },
  { slug: "georgian", name: "Georgian" },
  { slug: "kazakh", name: "Kazakh" },
  { slug: "khmer", name: "Khmer" },
  { slug: "kannada", name: "Kannada" },
  { slug: "korean", name: "Korean" },
  { slug: "latin", name: "Latin" },
  { slug: "luxembourgish", name: "Luxembourgish" },
  { slug: "lingala", name: "Lingala" },
  { slug: "lao", name: "Lao" },
  { slug: "lithuanian", name: "Lithuanian" },
  { slug: "latvian", name: "Latvian" },
  { slug: "malagasy", name: "Malagasy" },
  { slug: "maori", name: "Maori" },
  { slug: "macedonian", name: "Macedonian" },
  { slug: "malayalam", name: "Malayalam" },
  { slug: "mongolian", name: "Mongolian" },
  { slug: "marathi", name: "Marathi" },
  { slug: "malay", name: "Malay" },
  { slug: "maltese", name: "Maltese" },
  { slug: "myanmar", name: "Myanmar" },
  { slug: "nepali", name: "Nepali" },
  { slug: "dutch", name: "Dutch" },
  { slug: "norwegian-nynorsk", name: "Norwegian Nynorsk" },
  { slug: "norwegian", name: "Norwegian" },
  { slug: "occitan", name: "Occitan" },
  { slug: "punjabi", name: "Punjabi" },
  { slug: "polish", name: "Polish" },
  { slug: "pashto", name: "Pashto" },
  { slug: "portuguese", name: "Portuguese" },
  { slug: "romanian", name: "Romanian" },
  { slug: "russian", name: "Russian" },
  { slug: "sanskrit", name: "Sanskrit" },
  { slug: "sindhi", name: "Sindhi" },
  { slug: "sinhala", name: "Sinhala" },
  { slug: "slovak", name: "Slovak" },
  { slug: "slovenian", name: "Slovenian" },
  { slug: "shona", name: "Shona" },
  { slug: "somali", name: "Somali" },
  { slug: "albanian", name: "Albanian" },
  { slug: "serbian", name: "Serbian" },
  { slug: "sundanese", name: "Sundanese" },
  { slug: "swedish", name: "Swedish" },
  { slug: "swahili", name: "Swahili" },
  { slug: "tamil", name: "Tamil" },
  { slug: "telugu", name: "Telugu" },
  { slug: "tajik", name: "Tajik" },
  { slug: "thai", name: "Thai" },
  { slug: "turkmen", name: "Turkmen" },
  { slug: "tagalog", name: "Tagalog" },
  { slug: "turkish", name: "Turkish" },
  { slug: "tatar", name: "Tatar" },
  { slug: "ukrainian", name: "Ukrainian" },
  { slug: "urdu", name: "Urdu" },
  { slug: "uzbek", name: "Uzbek" },
  { slug: "vietnamese", name: "Vietnamese" },
  { slug: "yiddish", name: "Yiddish" },
  { slug: "yoruba", name: "Yoruba" },
  { slug: "chinese", name: "Chinese" },
  { slug: "cantonese", name: "Cantonese" },
  { slug: "mandarin", name: "Mandarin" },
  { slug: "bulgarian", name: "Bulgarian" },
];

function buildPlatformLanguageEntry(
  platformSlug: string,
  platformName: string,
  languageSlug: string,
  languageName: string
): ToolEntry {
  const keyword = `${languageName} captions for ${platformName}`.toLowerCase();
  const desc = `Turn long-form videos into ${platformName} clips with ${languageName} captions. Rendivia transcribes with Whisper and renders word-level captions with Remotion.`;
  const intro = `${platformName} clips perform best when captions are clear and consistent. Rendivia creates ${languageName} captions for ${platformName} by transcribing your long-form video, letting you select clips, and rendering burn-in captions with your brand style. The workflow is the same for every language.`;
  const benefits = [
    `Accurate ${languageName} transcription and word-level timing via Whisper`,
    `Brand-consistent caption styling for ${platformName} clips`,
    `Clip selection from long-form video for faster production`,
    `9:16 exports ready for short-form platforms`,
    `Same workflow across 99+ languages`,
  ];
  const faqs: ToolFaq[] = [
    {
      question: `How do I add ${languageName} captions to ${platformName}?`,
      answer: `Upload your long-form video to Rendivia, choose or auto-detect ${languageName}, select clips, and render. Whisper transcribes and times speech; Remotion renders burn-in ${languageName} captions.`,
    },
    {
      question: `Can I use my brand style for ${languageName} captions on ${platformName}?`,
      answer: `Yes. Set a brand preset so every ${platformName} export uses the same fonts and colors across ${languageName} and other languages.`,
    },
    {
      question: `Does Rendivia support ${languageName} for other platforms too?`,
      answer: `Yes. Rendivia supports ${languageName} for YouTube Shorts, TikTok, Instagram Reels, Facebook Reels, LinkedIn, and more. The same pipeline works for any platform.`,
    },
  ];
  const howToSteps = [
    `Upload your long-form video in the Rendivia dashboard or via API (Pro+).`,
    `Select ${languageName} or leave language on auto-detect.`,
    `Pick clip segments and apply your brand preset.`,
    `Render and download ${platformName}-ready MP4s.`,
  ];
  return {
    slug: `${platformSlug}-${languageSlug}`,
    name: `${platformName} + ${languageName}`,
    primaryKeyword: keyword,
    description: desc,
    intro,
    benefits,
    faqs,
    howToSteps,
    cta: `Get ${languageName} captions for ${platformName}`,
  };
}

/** Parse "platformSlug-languageSlug" by matching longest platform prefix. */
export function parsePlatformLanguageSlug(
  slug: string
): { platformSlug: string; languageSlug: string } | null {
  const platformsByLength = [...PLATFORMS_FOR_LANG].sort(
    (a, b) => b.slug.length - a.slug.length
  );
  for (const p of platformsByLength) {
    const prefix = p.slug + "-";
    if (slug.startsWith(prefix)) {
      const languageSlug = slug.slice(prefix.length);
      const hasLang = LANGUAGES_FOR_PLATFORM.some((l) => l.slug === languageSlug);
      if (hasLang) return { platformSlug: p.slug, languageSlug };
    }
  }
  return null;
}

export function getPlatformLanguageEntry(slug: string): ToolEntry | null {
  const parsed = parsePlatformLanguageSlug(slug);
  if (!parsed) return null;
  const platform = PLATFORMS_FOR_LANG.find((p) => p.slug === parsed.platformSlug);
  const language = LANGUAGES_FOR_PLATFORM.find((l) => l.slug === parsed.languageSlug);
  if (!platform || !language) return null;
  return buildPlatformLanguageEntry(
    platform.slug,
    platform.name,
    language.slug,
    language.name
  );
}

/** All platform-language slugs for generateStaticParams (8 × 101 = 808). */
export function getAllPlatformLanguageSlugs(): { platformSlug: string; languageSlug: string }[] {
  const result: { platformSlug: string; languageSlug: string }[] = [];
  for (const p of PLATFORMS_FOR_LANG) {
    for (const l of LANGUAGES_FOR_PLATFORM) {
      result.push({ platformSlug: p.slug, languageSlug: l.slug });
    }
  }
  return result;
}

/** Subset of platform-language entries for hub display (e.g. 24 popular combos). */
export function getPlatformLanguageHubEntries(): ToolEntry[] {
  const popular: [string, string][] = [
    ["youtube-shorts", "spanish"],
    ["youtube-shorts", "french"],
    ["youtube-shorts", "german"],
    ["youtube-shorts", "portuguese"],
    ["youtube-shorts", "japanese"],
    ["youtube-shorts", "korean"],
    ["tiktok", "spanish"],
    ["tiktok", "french"],
    ["tiktok", "portuguese"],
    ["tiktok", "vietnamese"],
    ["instagram-reels", "spanish"],
    ["instagram-reels", "french"],
    ["facebook-reels", "spanish"],
    ["facebook-reels", "arabic"],
    ["linkedin-video", "spanish"],
    ["linkedin-video", "french"],
    ["twitter-x", "spanish"],
    ["twitter-x", "japanese"],
    ["pinterest-video", "spanish"],
    ["pinterest-video", "portuguese"],
    ["snapchat", "spanish"],
    ["snapchat", "french"],
  ];
  return popular.map(([ps, ls]) => {
    const platform = PLATFORMS_FOR_LANG.find((p) => p.slug === ps)!;
    const language = LANGUAGES_FOR_PLATFORM.find((l) => l.slug === ls)!;
    return buildPlatformLanguageEntry(
      platform.slug,
      platform.name,
      language.slug,
      language.name
    );
  });
}
