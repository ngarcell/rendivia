import { notFound } from "next/navigation";
import PseoPageTemplate from "@/components/pseo/PseoPageTemplate";
import { getAlternativePage, getAlternativeStaticParams } from "@/data/pseo-api";

export function generateStaticParams() {
  return getAlternativeStaticParams();
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const page = getAlternativePage(params.slug);
  if (!page) return {};
  return {
    title: `${page.title} | Rendivia`,
    description: page.description,
  };
}

export default function AlternativePage({ params }: { params: { slug: string } }) {
  const page = getAlternativePage(params.slug);
  if (!page) return notFound();
  return (
    <PseoPageTemplate
      title={page.title}
      description={page.description}
      inputLabel={page.inputLabel}
      outputLabel={page.outputLabel}
      jsonExample={page.jsonExample}
    />
  );
}

export const dynamicParams = false;
