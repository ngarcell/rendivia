import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site";
import { getSeoInventory } from "@/lib/seo-index-policy";

function toDate(input: string): Date {
  const parsed = new Date(`${input}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date("2026-02-20T00:00:00.000Z");
  }
  return parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const inventory = getSeoInventory();

  return inventory.indexablePaths.map((path) => ({
    url: `${origin}${path}`,
    lastModified: toDate(
      inventory.pathLastModified.get(path) ?? inventory.fallbackLastUpdated
    ),
  }));
}
