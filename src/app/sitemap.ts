import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site";
import { getAllSlugsForStaticParams } from "@/data/tools";
import { getComparisonSlugs } from "@/data/seo";
import { getAlternativeStaticParams } from "@/data/pseo-api";
import { getAllPseoPages } from "@/lib/pseo";

const CHUNK_SIZE = 1000;

function chunkPaths(paths: string[], chunkSize: number) {
  const chunks: string[][] = [];
  for (let i = 0; i < paths.length; i += chunkSize) {
    chunks.push(paths.slice(i, i + chunkSize));
  }
  return chunks;
}

function parseSitemapId(id: string | string[] | number | undefined) {
  const raw = Array.isArray(id) ? id[0] : id;
  const idStr = typeof raw === "string" ? raw : String(raw ?? "");
  const clean = idStr.replace(/\\.xml$/i, "");
  const lastDash = clean.lastIndexOf("-");
  if (lastDash === -1) return { group: clean, index: 0 };
  const group = clean.slice(0, lastDash);
  const index = Number(clean.slice(lastDash + 1));
  return { group, index: Number.isFinite(index) ? index : 0 };
}

export async function generateSitemaps() {
  const toolParams = getAllSlugsForStaticParams();
  const toolEntries = toolParams
    .filter((entry) => entry.category !== "platform-language")
    .map(({ category, slug }) => `/tools/${category}/${slug}`);
  const platformLangEntries = toolParams
    .filter((entry) => entry.category === "platform-language")
    .map(({ category, slug }) => `/tools/${category}/${slug}`);
  const comparisonEntries = getComparisonSlugs().map((slug) => `/vs/${slug}`);
  const pseoPages = getAllPseoPages();
  const useCaseEntries = pseoPages
    .filter((page) => page.type === "use_case")
    .map((page) => page.canonicalUrl);
  const industryEntries = Array.from(
    new Set(
      useCaseEntries
        .map((entry) => entry.match(/^\/use-cases\/([^/]+)\//)?.[1])
        .filter(Boolean) as string[]
    )
  ).map((industry) => `/use-cases/${industry}`);
  const triggerEntries = pseoPages
    .filter((page) => page.type === "trigger")
    .map((page) => page.canonicalUrl);
  const dataSourceEntries = pseoPages
    .filter((page) => page.type === "data_source")
    .map((page) => page.canonicalUrl);
  const alternativeEntries = getAlternativeStaticParams().map(
    ({ slug }) => `/alternatives/${slug}`
  );

  const toolChunks = chunkPaths(toolEntries, CHUNK_SIZE);
  const platformLangChunks = chunkPaths(platformLangEntries, CHUNK_SIZE);
  const comparisonChunks = chunkPaths(comparisonEntries, CHUNK_SIZE);
  const useCaseChunks = chunkPaths(useCaseEntries, CHUNK_SIZE);
  const industryChunks = chunkPaths(industryEntries, CHUNK_SIZE);
  const triggerChunks = chunkPaths(triggerEntries, CHUNK_SIZE);
  const dataSourceChunks = chunkPaths(dataSourceEntries, CHUNK_SIZE);
  const alternativeChunks = chunkPaths(alternativeEntries, CHUNK_SIZE);

  return [
    { id: "core-0" },
    ...toolChunks.map((_, index) => ({ id: `tools-${index}` })),
    ...platformLangChunks.map((_, index) => ({ id: `tools-platform-language-${index}` })),
    ...comparisonChunks.map((_, index) => ({ id: `comparisons-${index}` })),
    ...useCaseChunks.map((_, index) => ({ id: `pseo-use-cases-${index}` })),
    ...industryChunks.map((_, index) => ({ id: `pseo-use-case-industries-${index}` })),
    ...triggerChunks.map((_, index) => ({ id: `pseo-triggers-${index}` })),
    ...dataSourceChunks.map((_, index) => ({ id: `pseo-data-${index}` })),
    ...alternativeChunks.map((_, index) => ({ id: `pseo-alternatives-${index}` })),
  ];
}

export default async function sitemap({
  id,
}: {
  id: string | string[] | number | undefined;
}): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const lastModified = new Date();

  const toEntry = (path: string) => ({
    url: `${origin}${path}`,
    lastModified,
  });

  const { group, index } = parseSitemapId(id);

  const toolParams = getAllSlugsForStaticParams();
  const toolEntries = toolParams
    .filter((entry) => entry.category !== "platform-language")
    .map(({ category, slug }) => `/tools/${category}/${slug}`);
  const platformLangEntries = toolParams
    .filter((entry) => entry.category === "platform-language")
    .map(({ category, slug }) => `/tools/${category}/${slug}`);
  const comparisonEntries = getComparisonSlugs().map((slug) => `/vs/${slug}`);
  const pseoPages = getAllPseoPages();
  const useCaseEntries = pseoPages
    .filter((page) => page.type === "use_case")
    .map((page) => page.canonicalUrl);
  const industryEntries = Array.from(
    new Set(
      useCaseEntries
        .map((entry) => entry.match(/^\/use-cases\/([^/]+)\//)?.[1])
        .filter(Boolean) as string[]
    )
  ).map((industry) => `/use-cases/${industry}`);
  const triggerEntries = pseoPages
    .filter((page) => page.type === "trigger")
    .map((page) => page.canonicalUrl);
  const dataSourceEntries = pseoPages
    .filter((page) => page.type === "data_source")
    .map((page) => page.canonicalUrl);
  const alternativeEntries = getAlternativeStaticParams().map(
    ({ slug }) => `/alternatives/${slug}`
  );

  const toolChunks = chunkPaths(toolEntries, CHUNK_SIZE);
  const platformLangChunks = chunkPaths(platformLangEntries, CHUNK_SIZE);
  const comparisonChunks = chunkPaths(comparisonEntries, CHUNK_SIZE);
  const useCaseChunks = chunkPaths(useCaseEntries, CHUNK_SIZE);
  const industryChunks = chunkPaths(industryEntries, CHUNK_SIZE);
  const triggerChunks = chunkPaths(triggerEntries, CHUNK_SIZE);
  const dataSourceChunks = chunkPaths(dataSourceEntries, CHUNK_SIZE);
  const alternativeChunks = chunkPaths(alternativeEntries, CHUNK_SIZE);

  switch (group) {
    case "core":
      return [
        toEntry("/"),
        toEntry("/pricing"),
        toEntry("/enterprise"),
        toEntry("/docs"),
        toEntry("/status"),
        toEntry("/tools"),
        toEntry("/vs"),
        toEntry("/use-cases"),
        toEntry("/when"),
        toEntry("/from"),
        toEntry("/alternatives"),
        toEntry("/privacy"),
        toEntry("/terms"),
      ];
    case "tools":
      return (toolChunks[index] ?? []).map(toEntry);
    case "tools-platform-language":
      return (platformLangChunks[index] ?? []).map(toEntry);
    case "comparisons":
      return (comparisonChunks[index] ?? []).map(toEntry);
    case "pseo-use-cases":
      return (useCaseChunks[index] ?? []).map(toEntry);
    case "pseo-use-case-industries":
      return (industryChunks[index] ?? []).map(toEntry);
    case "pseo-triggers":
      return (triggerChunks[index] ?? []).map(toEntry);
    case "pseo-data":
      return (dataSourceChunks[index] ?? []).map(toEntry);
    case "pseo-alternatives":
      return (alternativeChunks[index] ?? []).map(toEntry);
    default:
      return [];
  }
}
