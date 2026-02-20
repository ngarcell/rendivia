import { notFound } from "next/navigation";
import PseoPage from "@/components/pseo/PseoPage";
import { getPseoPageByCanonicalUrl, getStaticParamsForType } from "@/lib/pseo";
import { getRobotsForPath } from "@/lib/seo-index-policy";

export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticParamsForType("trigger");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event } = await params;
  const canonicalPath = `/when/${event}/generate-video`;
  const page = getPseoPageByCanonicalUrl(canonicalPath);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
    robots: getRobotsForPath(canonicalPath),
  };
}

export default async function TriggerPage({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event } = await params;
  const page = getPseoPageByCanonicalUrl(`/when/${event}/generate-video`);
  if (!page) return notFound();
  return <PseoPage page={page} />;
}
