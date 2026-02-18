import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import PseoPage from "@/components/pseo/PseoPage";
import { getPseoPageByCanonicalUrl } from "@/lib/pseo";
import { pseoPageSchema, type PseoPage as PseoPageType } from "@/lib/pseo-schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string; slug: string }>;
}) {
  const { industry, slug } = await params;
  const page = getPseoPageByCanonicalUrl(`/use-cases/${industry}/${slug}`);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
  };
}

function loadDirectUseCase(industry: string, slug: string): PseoPageType | null {
  const filePath = path.join(
    process.cwd(),
    "content",
    "pseo",
    "use-cases",
    `${industry}.${slug}.json`
  );
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  const parsed = pseoPageSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ industry: string; slug: string }>;
}) {
  const { industry, slug } = await params;
  const page =
    loadDirectUseCase(industry, slug) ??
    getPseoPageByCanonicalUrl(`/use-cases/${industry}/${slug}`);
  if (!page) return notFound();
  return <PseoPage page={page} />;
}
