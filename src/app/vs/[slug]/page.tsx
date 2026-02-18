import { notFound } from "next/navigation";
import { SeoComparisonPage } from "@/components/SeoComparisonPage";
import { getComparisonEntry, getComparisonSlugs, getRelatedComparisons } from "@/data/seo";
import { getSiteOrigin } from "@/lib/site";

export const revalidate = 86400;
export const dynamicParams = true;

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getComparisonEntry(slug);
  if (!entry) notFound();
  const related = getRelatedComparisons(slug, 6);

  return <SeoComparisonPage entry={entry} related={related} />;
}

export function generateStaticParams() {
  return getComparisonSlugs(12).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getComparisonEntry(slug);
  if (!entry) return { title: "Comparisons | Rendivia" };
  const origin = getSiteOrigin();
  return {
    title: `${entry.title} | Rendivia`,
    description: entry.summary,
    keywords: [entry.primaryKeyword, "rendivia", entry.competitor.name.toLowerCase()],
    alternates: {
      canonical: `${origin}/vs/${entry.slug}`,
    },
  };
}
