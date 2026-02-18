import fs from "fs";
import path from "path";
import { pseoPageSchema, type PseoPage } from "@/lib/pseo-schema";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "pseo");

let cache: PseoPage[] | null = null;

function loadPageFile(filePath: string): PseoPage | null {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  const parsed = pseoPageSchema.safeParse(data);
  if (!parsed.success) return null;
  return parsed.data;
}

function filePathForCanonicalUrl(url: string): string | null {
  const useCaseMatch = url.match(/^\/use-cases\/([^/]+)\/([^/]+)$/);
  if (useCaseMatch) {
    const [, industry, slug] = useCaseMatch;
    return path.join(CONTENT_DIR, "use-cases", `${industry}.${slug}.json`);
  }
  const dataMatch = url.match(/^\/from\/([^/]+)\/to\/video$/);
  if (dataMatch) {
    const [, source] = dataMatch;
    return path.join(CONTENT_DIR, "data-sources", `${source}.to-video.json`);
  }
  const triggerMatch = url.match(/^\/when\/([^/]+)\/generate-video$/);
  if (triggerMatch) {
    const [, event] = triggerMatch;
    return path.join(CONTENT_DIR, "triggers", `${event}.generate-video.json`);
  }
  return null;
}

function listJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_")) continue;
      files.push(...listJsonFiles(resolved));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      if (entry.name.startsWith("_")) continue;
      files.push(resolved);
    }
  }
  return files;
}

function loadAllPages(): PseoPage[] {
  const files = listJsonFiles(CONTENT_DIR);
  const pages: PseoPage[] = [];
  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    const parsed = pseoPageSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid pSEO JSON: ${filePath} - ${parsed.error.message}`);
    }
    pages.push(parsed.data);
  }
  return pages;
}

export function getAllPseoPages(): PseoPage[] {
  if (process.env.NODE_ENV !== "production" || process.env.PSEO_DISABLE_CACHE === "true") {
    return loadAllPages();
  }
  if (!cache) cache = loadAllPages();
  return cache;
}

export function getPseoPagesByType(type: PseoPage["type"]): PseoPage[] {
  return getAllPseoPages().filter((page) => page.type === type);
}

export function getPseoPageByCanonicalUrl(url: string): PseoPage | null {
  const directPath = filePathForCanonicalUrl(url);
  if (directPath) {
    const direct = loadPageFile(directPath);
    if (direct) return direct;
  }
  return getAllPseoPages().find((page) => page.canonicalUrl === url) ?? null;
}

export function getStaticParamsForType(type: PseoPage["type"]) {
  const pages = getPseoPagesByType(type);
  if (type === "use_case") {
    return pages
      .map((page) => {
        const match = page.canonicalUrl.match(/^\/use-cases\/([^/]+)\/([^/]+)$/);
        if (!match) return null;
        return { industry: match[1], slug: match[2] };
      })
      .filter(Boolean) as Array<{ industry: string; slug: string }>;
  }
  if (type === "data_source") {
    return pages
      .map((page) => {
        const match = page.canonicalUrl.match(/^\/from\/([^/]+)\/to\/video$/);
        if (!match) return null;
        return { source: match[1] };
      })
      .filter(Boolean) as Array<{ source: string }>;
  }
  return pages
    .map((page) => {
      const match = page.canonicalUrl.match(/^\/when\/([^/]+)\/generate-video$/);
      if (!match) return null;
      return { event: match[1] };
    })
    .filter(Boolean) as Array<{ event: string }>;
}
