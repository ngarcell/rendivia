import { notFound } from "next/navigation";
import PseoPage from "@/components/pseo/PseoPage";
import { getPseoPageByCanonicalUrl, getStaticParamsForType } from "@/lib/pseo";
import { getRobotsForPath } from "@/lib/seo-index-policy";

export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticParamsForType("use_case");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string; slug: string }>;
}) {
  const { industry, slug } = await params;
  const canonicalPath = `/use-cases/${industry}/${slug}`;
  const page = getPseoPageByCanonicalUrl(canonicalPath);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
    robots: getRobotsForPath(canonicalPath),
  };
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ industry: string; slug: string }>;
}) {
  const { industry, slug } = await params;
  const page = getPseoPageByCanonicalUrl(`/use-cases/${industry}/${slug}`);
  if (!page) return notFound();
  return <PseoPage page={page} />;
}
