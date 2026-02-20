import { notFound } from "next/navigation";
import PseoPage from "@/components/pseo/PseoPage";
import { getPseoPageByCanonicalUrl, getStaticParamsForType } from "@/lib/pseo";
import { getRobotsForPath } from "@/lib/seo-index-policy";

export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticParamsForType("buyer_intent");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string; slug: string; intent: string }>;
}) {
  const { industry, slug, intent } = await params;
  const canonicalPath = `/use-cases/${industry}/${slug}/${intent}`;
  const page = getPseoPageByCanonicalUrl(canonicalPath);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
    robots: getRobotsForPath(canonicalPath),
  };
}

export default async function BuyerIntentPage({
  params,
}: {
  params: Promise<{ industry: string; slug: string; intent: string }>;
}) {
  const { industry, slug, intent } = await params;
  const page = getPseoPageByCanonicalUrl(`/use-cases/${industry}/${slug}/${intent}`);
  if (!page) return notFound();
  return <PseoPage page={page} />;
}
