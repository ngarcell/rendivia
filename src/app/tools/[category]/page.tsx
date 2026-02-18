import { redirect, notFound } from "next/navigation";
import { resolveLegacySlug } from "@/data/tools";

/**
 * Single-segment /tools/[category]: legacy flat slugs (e.g. /tools/youtube-shorts-captions)
 * redirect to category-based URL. Otherwise 404. Two-segment URLs are handled by
 * [category]/[slug]/page.tsx. Same param name "category" for first segment avoids
 * Next.js "different slug names" error.
 */
export default async function LegacyToolCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: segment } = await params;
  const resolved = resolveLegacySlug(segment);
  if (resolved) {
    redirect(`/tools/${resolved.category}/${resolved.slug}`);
  }
  notFound();
}

export async function generateMetadata() {
  return { title: "Tools | Rendivia" };
}
