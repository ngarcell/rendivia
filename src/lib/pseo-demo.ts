import path from "path";

export type PseoDemoType = "use_case" | "data_source" | "trigger";

export function getPseoDemoVideoUrl(canonicalUrl: string): string | null {
  const filePath = getPseoDemoVideoRelativePath(canonicalUrl);
  return filePath ? `/${filePath.replace(/\\/g, "/")}` : null;
}

export function getPseoDemoVideoRelativePath(canonicalUrl: string): string | null {
  const useCaseMatch = canonicalUrl.match(/^\/use-cases\/([^/]+)\/([^/]+)$/);
  if (useCaseMatch) {
    const [, industry, slug] = useCaseMatch;
    return `pseo-demos/use-cases/${industry}/${slug}.mp4`;
  }
  const dataMatch = canonicalUrl.match(/^\/from\/([^/]+)\/to\/video$/);
  if (dataMatch) {
    const [, source] = dataMatch;
    return `pseo-demos/data-sources/${source}.mp4`;
  }
  const triggerMatch = canonicalUrl.match(/^\/when\/([^/]+)\/generate-video$/);
  if (triggerMatch) {
    const [, event] = triggerMatch;
    return `pseo-demos/triggers/${event}.mp4`;
  }
  return null;
}

export function getPseoDemoVideoFilePath(canonicalUrl: string): string | null {
  const rel = getPseoDemoVideoRelativePath(canonicalUrl);
  if (!rel) return null;
  return path.join(process.cwd(), "public", rel);
}
