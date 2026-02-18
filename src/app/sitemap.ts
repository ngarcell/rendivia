import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site";
import { getAllSlugsForStaticParams } from "@/data/tools";
import { getComparisonSlugs } from "@/data/seo";
import { getAlternativeStaticParams } from "@/data/pseo-api";
import { getAllPseoPages } from "@/lib/pseo";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const lastModified = new Date();

  const toolParams = getAllSlugsForStaticParams();
  const toolEntries = toolParams.map(({ category, slug }) => `/tools/${category}/${slug}`);
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

  const paths = Array.from(
    new Set([
      "/",
      "/pricing",
      "/enterprise",
      "/docs",
      "/status",
      "/tools",
      "/vs",
      "/use-cases",
      "/when",
      "/from",
      "/alternatives",
      "/privacy",
      "/terms",
      ...toolEntries,
      ...comparisonEntries,
      ...industryEntries,
      ...useCaseEntries,
      ...triggerEntries,
      ...dataSourceEntries,
      ...alternativeEntries,
    ])
  );

  return paths.map((path) => ({
    url: `${origin}${path}`,
    lastModified,
  }));
}
