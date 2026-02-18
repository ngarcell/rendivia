import { notFound } from "next/navigation";
import PseoPage from "@/components/pseo/PseoPage";
import { getPseoPageByCanonicalUrl } from "@/lib/pseo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ event: string }>;
}) {
  const { event } = await params;
  const page = getPseoPageByCanonicalUrl(`/when/${event}/generate-video`);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
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
