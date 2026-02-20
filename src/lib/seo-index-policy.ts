import fs from "node:fs";
import path from "node:path";
import { getAllSlugsForStaticParams } from "../data/tools";
import { getComparisonSlugs } from "../data/seo";
import { getAlternativeStaticParams } from "../data/pseo-api";
import { getAllPseoPages } from "./pseo";
import type { PseoPage } from "./pseo-schema";

export type IndexPolicy = {
  targetIndexableCount: number;
  maxIndexableBuyerIntent: number;
  fallbackLastUpdated: string;
  industryOrder: string[];
  useCaseOrder: string[];
  intentOrder: string[];
  intentWeights: Record<string, number>;
};

export type SeoInventory = {
  targetIndexableCount: number;
  fallbackLastUpdated: string;
  allPaths: string[];
  existingPaths: string[];
  buyerIntentPaths: string[];
  indexablePaths: string[];
  indexablePathSet: Set<string>;
  noindexPaths: string[];
  pathLastModified: Map<string, string>;
};

const ROOT = process.cwd();
const INPUTS_DIR = path.join(ROOT, "content", "pseo", "_inputs");
const POLICY_PATH = path.join(INPUTS_DIR, "index-priority.json");

const STATIC_PATHS = [
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
];

let cache: SeoInventory | null = null;

function normalizePath(input: string): string {
  if (!input) return "/";
  if (input.startsWith("http://") || input.startsWith("https://")) {
    const parsed = new URL(input);
    return parsed.pathname || "/";
  }
  return input.startsWith("/") ? input : `/${input}`;
}

function loadPolicy(): IndexPolicy {
  const fallback: IndexPolicy = {
    targetIndexableCount: 4000,
    maxIndexableBuyerIntent: 2317,
    fallbackLastUpdated: "2026-02-20",
    industryOrder: [],
    useCaseOrder: [],
    intentOrder: [
      "video-api-software",
      "video-api-pricing",
      "video-automation-service",
    ],
    intentWeights: {
      "video-api-software": 120,
      "video-api-pricing": 100,
      "video-automation-service": 90,
    },
  };

  if (!fs.existsSync(POLICY_PATH)) return fallback;

  try {
    const raw = fs.readFileSync(POLICY_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<IndexPolicy>;
    return {
      targetIndexableCount: parsed.targetIndexableCount ?? fallback.targetIndexableCount,
      maxIndexableBuyerIntent:
        parsed.maxIndexableBuyerIntent ?? fallback.maxIndexableBuyerIntent,
      fallbackLastUpdated:
        parsed.fallbackLastUpdated ?? fallback.fallbackLastUpdated,
      industryOrder: parsed.industryOrder ?? fallback.industryOrder,
      useCaseOrder: parsed.useCaseOrder ?? fallback.useCaseOrder,
      intentOrder: parsed.intentOrder ?? fallback.intentOrder,
      intentWeights: parsed.intentWeights ?? fallback.intentWeights,
    };
  } catch {
    return fallback;
  }
}

function industryHubEntries(useCaseEntries: string[]): string[] {
  const industries = Array.from(
    new Set(
      useCaseEntries
        .map((entry) => entry.match(/^\/use-cases\/([^/]+)\//)?.[1])
        .filter(Boolean) as string[]
    )
  );
  return industries.map((industry) => `/use-cases/${industry}`);
}

function parseBuyerIntent(pathname: string): {
  industry: string;
  useCase: string;
  intent: string;
} | null {
  const match = pathname.match(/^\/use-cases\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return { industry: match[1], useCase: match[2], intent: match[3] };
}

function rankWeight(order: string[], value: string, step: number): number {
  const index = order.indexOf(value);
  if (index === -1) return 0;
  return (order.length - index) * step;
}

function buildBuyerIntentRanking(
  entries: string[],
  policy: IndexPolicy
): Array<{ path: string; score: number }> {
  return entries
    .map((entry) => {
      const parsed = parseBuyerIntent(entry);
      if (!parsed) return { path: entry, score: 0 };
      const industryRankWeight = rankWeight(policy.industryOrder, parsed.industry, 1000);
      const useCaseRankWeight = rankWeight(policy.useCaseOrder, parsed.useCase, 10);
      const intentWeight = policy.intentWeights[parsed.intent] ?? 0;
      const score = industryRankWeight + useCaseRankWeight + intentWeight;
      return { path: entry, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.path.localeCompare(b.path);
    });
}

function computeInventory(): SeoInventory {
  const policy = loadPolicy();
  const allPages = getAllPseoPages();

  const toolEntries = getAllSlugsForStaticParams().map(
    ({ category, slug }) => `/tools/${category}/${slug}`
  );
  const comparisonEntries = getComparisonSlugs().map((slug) => `/vs/${slug}`);
  const alternativeEntries = getAlternativeStaticParams().map(
    ({ slug }) => `/alternatives/${slug}`
  );

  const useCaseEntries = allPages
    .filter((page) => page.type === "use_case")
    .map((page) => page.canonicalUrl);
  const triggerEntries = allPages
    .filter((page) => page.type === "trigger")
    .map((page) => page.canonicalUrl);
  const dataSourceEntries = allPages
    .filter((page) => page.type === "data_source")
    .map((page) => page.canonicalUrl);
  const buyerIntentEntries = allPages
    .filter((page) => page.type === "buyer_intent")
    .map((page) => page.canonicalUrl);

  const existingPaths = Array.from(
    new Set([
      ...STATIC_PATHS,
      ...toolEntries,
      ...comparisonEntries,
      ...industryHubEntries(useCaseEntries),
      ...useCaseEntries,
      ...triggerEntries,
      ...dataSourceEntries,
      ...alternativeEntries,
    ])
  ).map(normalizePath);

  const sortedBuyerIntent = buildBuyerIntentRanking(
    Array.from(new Set(buyerIntentEntries)).map(normalizePath),
    policy
  );

  const target = policy.targetIndexableCount;
  const buyerLimit = Math.max(0, policy.maxIndexableBuyerIntent);
  const indexable = new Set<string>();

  const existingSorted = [...existingPaths].sort((a, b) => a.localeCompare(b));
  for (const path of existingSorted) {
    if (indexable.size >= target) break;
    indexable.add(path);
  }

  const buyerCapByTarget = Math.max(0, target - indexable.size);
  const buyerCap = Math.min(buyerLimit, buyerCapByTarget);
  for (const item of sortedBuyerIntent.slice(0, buyerCap)) {
    if (indexable.size >= target) break;
    indexable.add(item.path);
  }

  for (const item of sortedBuyerIntent) {
    if (indexable.size >= target) break;
    indexable.add(item.path);
  }

  const allPaths = Array.from(
    new Set([
      ...existingSorted,
      ...sortedBuyerIntent.map((item) => item.path),
    ])
  ).sort((a, b) => a.localeCompare(b));

  const noindexPaths = allPaths.filter((path) => !indexable.has(path));

  const lastModByCanonical = new Map<string, string>();
  for (const page of allPages) {
    lastModByCanonical.set(page.canonicalUrl, page.lastUpdated ?? policy.fallbackLastUpdated);
  }

  const pathLastModified = new Map<string, string>();
  for (const path of allPaths) {
    pathLastModified.set(path, lastModByCanonical.get(path) ?? policy.fallbackLastUpdated);
  }

  return {
    targetIndexableCount: target,
    fallbackLastUpdated: policy.fallbackLastUpdated,
    allPaths,
    existingPaths: existingSorted,
    buyerIntentPaths: sortedBuyerIntent.map((item) => item.path),
    indexablePaths: Array.from(indexable).sort((a, b) => a.localeCompare(b)),
    indexablePathSet: indexable,
    noindexPaths,
    pathLastModified,
  };
}

export function getSeoInventory(): SeoInventory {
  if (process.env.NODE_ENV !== "production" || process.env.PSEO_DISABLE_CACHE === "true") {
    return computeInventory();
  }
  if (!cache) cache = computeInventory();
  return cache;
}

export function isIndexablePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return getSeoInventory().indexablePathSet.has(path);
}

export function getPathLastModified(pathname: string): string {
  const path = normalizePath(pathname);
  const inventory = getSeoInventory();
  return inventory.pathLastModified.get(path) ?? inventory.fallbackLastUpdated;
}

export function getRobotsForPath(pathname: string) {
  if (isIndexablePath(pathname)) {
    return { index: true, follow: true };
  }
  return { index: false, follow: true };
}
