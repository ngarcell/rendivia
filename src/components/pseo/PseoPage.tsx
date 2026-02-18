import fs from "fs";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import type { PseoPage } from "@/lib/pseo-schema";
import { getPseoDemoVideoFilePath, getPseoDemoVideoUrl } from "@/lib/pseo-demo";
import { getSiteOrigin } from "@/lib/site";

const ARCHITECTURE_DIAGRAM = `Data source / event
  |
  v
Rendivia Render API
  |
  v
Queue + Workers
  |
  v
Remotion templates
  |
  v
Branded MP4 + webhook`;

type ContextLink = { label: string; href: string };

function buildBreadcrumbs(page: PseoPage) {
  if (page.type === "use_case") {
    const match = page.canonicalUrl.match(/^\/use-cases\/([^/]+)\/([^/]+)$/);
    const industry = match?.[1] ?? "use-cases";
    return [
      { name: "Home", url: "/" },
      { name: "Use cases", url: "/use-cases" },
      { name: industry.replace(/-/g, " "), url: `/use-cases/${industry}` },
      { name: page.title, url: page.canonicalUrl },
    ];
  }
  if (page.type === "data_source") {
    return [
      { name: "Home", url: "/" },
      { name: "Data sources", url: "/from" },
      { name: page.title, url: page.canonicalUrl },
    ];
  }
  return [
    { name: "Home", url: "/" },
    { name: "Triggers", url: "/when" },
    { name: page.title, url: page.canonicalUrl },
  ];
}

function formatLabel(input?: string) {
  if (!input) return "Industry";
  return input
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function buildContextLinks(page: PseoPage): ContextLink[] {
  const links: ContextLink[] = [];

  if (page.type === "use_case") {
    const match = page.canonicalUrl.match(/^\/use-cases\/([^/]+)\//);
    if (match?.[1]) {
      links.push({
        label: `${formatLabel(match[1])} use cases`,
        href: `/use-cases/${match[1]}`,
      });
    }
  }

  links.push(
    { label: "Use cases", href: "/use-cases" },
    { label: "Data sources", href: "/from" },
    { label: "Triggers", href: "/when" },
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/pricing" }
  );

  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export default function PseoPage({ page }: { page: PseoPage }) {
  const origin = getSiteOrigin();
  const inputJson = JSON.stringify(page.io.inputJsonExample, null, 2);
  const contextLinks = buildContextLinks(page);
  const demoVideoPath = getPseoDemoVideoFilePath(page.canonicalUrl);
  const demoVideoUrl = getPseoDemoVideoUrl(page.canonicalUrl);
  const demoVideoExists = demoVideoPath ? fs.existsSync(demoVideoPath) : false;
  const faqJsonLd = page.faq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      }
    : null;

  const breadcrumbItems = buildBreadcrumbs(page);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${origin}${crumb.url}`,
    })),
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Rendivia",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: page.metaDescription,
    url: `${origin}${page.canonicalUrl}`,
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {page.hero.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
            {page.hero.headline}
          </h1>
          <p className="mt-4 text-lg text-zinc-600">{page.hero.subheadline}</p>
          {page.hero.supportLine && (
            <p className="mt-3 text-sm text-zinc-500">{page.hero.supportLine}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={page.hero.primaryCta.href}
              className="touch-target inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              {page.hero.primaryCta.label}
            </Link>
            {page.hero.secondaryCta && (
              <Link
                href={page.hero.secondaryCta.href}
                className="touch-target text-sm font-semibold text-zinc-600 hover:text-zinc-900"
              >
                {page.hero.secondaryCta.label}
              </Link>
            )}
          </div>
          {contextLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-500">Explore:</span>
              {contextLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="touch-target inline-flex min-h-[32px] items-center font-semibold text-zinc-500 hover:text-zinc-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">{page.problem.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              {page.problem.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">{page.solution.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              {page.solution.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{page.io.inputTitle}</h2>
            <div className="mt-3">
              <CodeBlock code={inputJson} />
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">{page.io.outputTitle}</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              {page.io.outputBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </section>

        {demoVideoUrl && demoVideoExists && (
          <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-zinc-900">Demo video</h2>
              <span className="text-xs text-zinc-500">30-45 seconds</span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              A contextual, data-visualization walkthrough of the end-to-end render flow.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-black">
              <video
                controls
                preload="metadata"
                className="h-full w-full"
                src={demoVideoUrl}
              />
            </div>
          </section>
        )}

        <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Architecture</h2>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-zinc-200 bg-[var(--muted-bg)] p-4 text-xs text-zinc-600">
            {ARCHITECTURE_DIAGRAM}
          </pre>
        </section>

        <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">{page.howItWorks.title}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {page.howItWorks.steps.map((step) => (
              <div key={step.title} className="rounded-xl border border-zinc-200 p-4">
                <h3 className="text-sm font-semibold text-zinc-900">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">{page.benefits.title}</h2>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            {page.benefits.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>

        {page.faq && page.faq.length > 0 && (
          <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900">Common questions</h2>
            <div className="mt-4 space-y-4">
              {page.faq.map((item) => (
                <div key={item.q} className="border-b border-zinc-200 pb-4 last:border-0">
                  <h3 className="text-sm font-semibold text-zinc-900">{item.q}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Related</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="touch-target inline-flex min-h-[40px] items-center rounded-full border border-zinc-200 bg-[var(--muted-bg)] px-3 text-xs font-medium text-zinc-700 hover:border-zinc-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">{page.cta.title}</h2>
          <p className="mt-2 text-sm text-zinc-600">{page.cta.body}</p>
          <Link
            href={page.cta.primary.href}
            className="touch-target mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            {page.cta.primary.label}
          </Link>
        </section>
      </main>
    </div>
  );
}
