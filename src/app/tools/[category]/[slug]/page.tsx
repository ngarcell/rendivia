import { notFound } from "next/navigation";
import {
  type ToolCategory,
  TOOL_CATEGORIES,
  getToolEntry,
  getRelatedToolEntries,
  getAllSlugsForStaticParams,
} from "@/data/tools";
import { ToolPageTemplate } from "../../ToolPageTemplate";

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  platform: "By platform",
  language: "By language",
  "use-case": "By use case",
  feature: "By feature",
  vertical: "By vertical",
  "platform-language": "By platform & language",
};

export default async function ToolCategoryPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  if (!TOOL_CATEGORIES.includes(category as ToolCategory)) notFound();
  const entry = getToolEntry(category as ToolCategory, slug);
  if (!entry) notFound();
  const related = getRelatedToolEntries(category as ToolCategory, slug, 4);

  return (
    <ToolPageTemplate
      entry={entry}
      category={category as ToolCategory}
      categoryLabel={CATEGORY_LABELS[category as ToolCategory]}
      related={related}
    />
  );
}

export function generateStaticParams() {
  return getAllSlugsForStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  if (!TOOL_CATEGORIES.includes(category as ToolCategory)) {
    return { title: "Tools | Rendivia" };
  }
  const entry = getToolEntry(category as ToolCategory, slug);
  if (!entry) return { title: "Tools | Rendivia" };
  return {
    title: `${entry.primaryKeyword} | Rendivia`,
    description: entry.description,
    keywords: entry.primaryKeyword,
  };
}
