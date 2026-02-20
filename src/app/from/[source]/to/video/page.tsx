import { notFound } from "next/navigation";
import PseoPage from "@/components/pseo/PseoPage";
import { getPseoPageByCanonicalUrl, getStaticParamsForType } from "@/lib/pseo";
import { getRobotsForPath } from "@/lib/seo-index-policy";

export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticParamsForType("data_source");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source } = await params;
  const canonicalPath = `/from/${source}/to/video`;
  const page = getPseoPageByCanonicalUrl(canonicalPath);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
    robots: getRobotsForPath(canonicalPath),
  };
}

export default async function DataSourcePage({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source } = await params;
  const page = getPseoPageByCanonicalUrl(`/from/${source}/to/video`);
  if (!page) return notFound();
  return <PseoPage page={page} />;
}
