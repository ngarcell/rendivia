import type { ToolCategory } from "@/data/tools";

const ENABLE_MARKETING_VIDEOS = process.env.NEXT_PUBLIC_MARKETING_VIDEOS === "true";

export function marketingVideosEnabled(): boolean {
  return ENABLE_MARKETING_VIDEOS;
}

export function getToolMarketingVideoUrl(category: ToolCategory, slug: string): string {
  return `/marketing-videos/tools/${category}/${slug}.mp4`;
}

export function getComparisonMarketingVideoUrl(slug: string): string {
  return `/marketing-videos/vs/${slug}.mp4`;
}
