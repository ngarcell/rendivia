import { notFound } from "next/navigation";
import PseoPageTemplate from "@/components/pseo/PseoPageTemplate";
import { getAlternativePage, getAlternativeStaticParams } from "@/data/pseo-api";

export function generateStaticParams() {
  return getAlternativeStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getAlternativePage(slug);
  if (!page) return {};
  return {
    title: `${page.title} | Rendivia`,
    description: page.description,
  };
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getAlternativePage(slug);
  if (!page) return notFound();
  return (
    <PseoPageTemplate
      title={page.title}
      description={page.description}
      inputLabel={page.inputLabel}
      outputLabel={page.outputLabel}
      jsonExample={page.jsonExample}
      canonicalPath={`/alternatives/${slug}`}
    />
  );
}

export const dynamicParams = false;
