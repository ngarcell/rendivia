/* -------------------------------------------------------------------------------------------------
  generate-pseo.ts
  Generate pSEO JSON files (industry x use-case) into: /content/pseo/use-cases/

  Usage:
    1) Put this file at: /scripts/generate-pseo.ts
    2) Create input files in: /content/pseo/_inputs/
    3) Run:
        pnpm ts-node scripts/generate-pseo.ts
       or
        npx ts-node scripts/generate-pseo.ts
       or (recommended) add package.json script:
        "gen:pseo": "ts-node scripts/generate-pseo.ts"
        then run: pnpm gen:pseo

  Notes:
    - No external deps required.
    - Outputs deterministic JSON (stable ordering).
-------------------------------------------------------------------------------------------------- */

import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";

type CTA = { label: string; href: string };
type Hero = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: CTA;
  secondaryCta: CTA;
};

type Problem = { title: string; bullets: string[] };
type Solution = { title: string; bullets: string[] };

type IOSpec = {
  inputTitle: string;
  inputJsonExample: Record<string, unknown>;
  outputTitle: string;
  outputBullets: string[];
};

type HowItWorks = {
  title: string;
  steps: Array<{ title: string; body: string }>;
};

type Benefits = { title: string; bullets: string[] };

type FAQ = Array<{ q: string; a: string }>;

type Related = Array<{ label: string; href: string }>;

type PseoPage = {
  type: "use_case";
  version: 1;
  id: string;
  canonicalUrl: string;

  title: string;
  metaTitle: string;
  metaDescription: string;

  hero: Hero;
  problem: Problem;
  solution: Solution;
  io: IOSpec;
  howItWorks: HowItWorks;
  benefits: Benefits;
  faq?: FAQ;
  related: Related;
  cta: {
    title: string;
    body: string;
    primary: CTA;
  };
};

type IndustryInput = {
  key: string;
  label: string;
  tagline?: string;
  coreEntities: string[];
  exampleMetrics: Array<{ key: string; label: string; example: string | number }>;
  problemBullets: string[];
  benefitBullets: string[];
  deliveryExamples: string[];
};

type UseCaseInput = {
  key: string;
  label: string;
  short: string;
  trigger: { key: string; label: string; description: string };
  templateId: string;
  requiredFields: string[];
  howItWorksSteps: Array<{ title: string; body: string }>;
  outputBullets: string[];
  faq: FAQ;
};

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "content", "pseo", "_inputs");
const OUT_DIR = path.join(ROOT, "content", "pseo", "use-cases");

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function stableStringify(obj: unknown): string {
  const seen = new WeakSet<object>();

  const sorter = (value: unknown): unknown => {
    if (value && typeof value === "object") {
      if (seen.has(value as object)) return value;
      seen.add(value as object);

      if (Array.isArray(value)) return value.map(sorter);

      const keys = Object.keys(value as Record<string, unknown>).sort();
      const out: Record<string, unknown> = {};
      for (const k of keys) out[k] = sorter((value as Record<string, unknown>)[k]);
      return out;
    }
    return value;
  };

  return JSON.stringify(sorter(obj), null, 2) + "\n";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function hashId(str: string): string {
  return createHash("sha1").update(str).digest("hex").slice(0, 10);
}

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function buildMetaTitle(brand: string, industryLabel: string, useCaseLabel: string) {
  return `${useCaseLabel} for ${industryLabel} | ${brand}`;
}

function buildMetaDescription(industry: IndustryInput, useCase: UseCaseInput) {
  const m1 = pick(industry.exampleMetrics, 0);
  const m2 = pick(industry.exampleMetrics, 1);
  const metricsHint = m1 && m2 ? `${m1.label}, ${m2.label}` : "key metrics";
  return `Generate deterministic, branded videos for ${industry.label} using a simple API. Automate ${useCase.label.toLowerCase()} from structured data (${metricsHint}). Includes webhooks and brand profiles.`;
}

function buildInputExample(industry: IndustryInput, useCase: UseCaseInput) {
  const m = industry.exampleMetrics.slice(0, 5);
  const metricsObj: Record<string, unknown> = {};
  for (const metric of m) metricsObj[metric.key] = metric.example;

  const base: Record<string, unknown> = {
    template: useCase.templateId,
    brand: slugify(industry.label),
    data: {
      period: useCase.trigger.key.includes("weekly")
        ? "2026-W05"
        : useCase.trigger.key.includes("monthly")
        ? "2026-01"
        : useCase.trigger.key.includes("quarter")
        ? "2026-Q1"
        : "2026-01-14",
      ...metricsObj,
      highlight: pick(industry.coreEntities, 0),
    },
  };

  for (const f of useCase.requiredFields) {
    if (!(f in (base.data as Record<string, unknown>))) {
      (base.data as Record<string, unknown>)[f] = f === "kpis" ? metricsObj : `example-${f}`;
    }
  }

  return base;
}

function buildRelated(industry: IndustryInput, useCase: UseCaseInput): Related {
  const baseUseCases = ["monthly-metrics-video", "investor-update-video", "customer-success-recap-video"];
  const related: Related = [];

  for (const key of baseUseCases) {
    if (key === useCase.key) continue;
    related.push({
      label: `${key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} for ${industry.label}`,
      href: `/use-cases/${industry.key}/${key}`,
    });
    if (related.length >= 2) break;
  }

  related.push({
    label: "From Postgres to video",
    href: "/from/postgres/to/video",
  });

  return related;
}

function buildPage(brandName: string, industry: IndustryInput, useCase: UseCaseInput): PseoPage {
  const canonicalUrl = `/use-cases/${industry.key}/${useCase.key}`;
  const id = `use_case.${industry.key}.${useCase.key}.${hashId(canonicalUrl)}`;

  const title = `${useCase.label} for ${industry.label}`;
  const metaTitle = buildMetaTitle(brandName, industry.label, useCase.label);
  const metaDescription = buildMetaDescription(industry, useCase);

  const hero: Hero = {
    eyebrow: "Use case",
    headline: title,
    subheadline: useCase.short,
    primaryCta: { label: "Get API key", href: "/dashboard" },
    secondaryCta: { label: "View docs", href: "/docs" },
  };

  const problem: Problem = {
    title: `Why ${industry.label} teams still ship reports manually`,
    bullets: industry.problemBullets,
  };

  const solution: Solution = {
    title: `Automate ${useCase.label.toLowerCase()} with an API`,
    bullets: [
      `Trigger the workflow when ${useCase.trigger.label.toLowerCase()} happens.`,
      `POST structured data to /render using template ${useCase.templateId}.`,
      `Render asynchronously at scale and receive a webhook when the MP4 is ready.`,
      `Deliver the video via ${pick(industry.deliveryExamples, 0)}, ${pick(industry.deliveryExamples, 1)}, or ${pick(industry.deliveryExamples, 2)}.`,
    ],
  };

  const io: IOSpec = {
    inputTitle: "Input (structured data)",
    inputJsonExample: buildInputExample(industry, useCase),
    outputTitle: "Output (deterministic MP4)",
    outputBullets: useCase.outputBullets,
  };

  const howItWorks: HowItWorks = {
    title: "How it works",
    steps: useCase.howItWorksSteps,
  };

  const benefits: Benefits = {
    title: "Benefits",
    bullets: [
      ...industry.benefitBullets.slice(0, 2),
      "Deterministic output you can trust in production.",
      `A repeatable workflow triggered by ${useCase.trigger.label.toLowerCase()}.`,
    ],
  };

  const related = buildRelated(industry, useCase);

  const cta = {
    title: `Generate ${useCase.label.toLowerCase()} via API`,
    body: `Create an API key and render your first ${useCase.label.toLowerCase()} in minutes.`,
    primary: { label: "Get API key", href: "/dashboard" },
  };

  const page: PseoPage = {
    type: "use_case",
    version: 1,
    id,
    canonicalUrl,
    title,
    metaTitle,
    metaDescription,
    hero,
    problem,
    solution,
    io,
    howItWorks,
    benefits,
    faq: useCase.faq,
    related,
    cta,
  };

  return page;
}

function writePageFile(page: PseoPage) {
  const fileName = `${page.canonicalUrl.replace(/^\/use-cases\//, "").replace(/\//g, ".")}.json`;
  const outPath = path.join(OUT_DIR, fileName);
  const shouldOverwrite = process.env.PSEO_OVERWRITE === "true";
  if (!shouldOverwrite && fs.existsSync(outPath)) {
    return;
  }
  fs.writeFileSync(outPath, stableStringify(page), "utf8");
}

function main() {
  const brandName = "Rendivia";

  const industriesPath = path.join(INPUT_DIR, "industries.json");
  const useCasesPath = path.join(INPUT_DIR, "useCases.json");

  if (!fs.existsSync(industriesPath) || !fs.existsSync(useCasesPath)) {
    console.error("Missing inputs. Create:");
    console.error(" - content/pseo/_inputs/industries.json");
    console.error(" - content/pseo/_inputs/useCases.json");
    process.exit(1);
  }

  const industries = readJsonFile<IndustryInput[]>(industriesPath);
  const useCases = readJsonFile<UseCaseInput[]>(useCasesPath);

  ensureDir(OUT_DIR);

  let count = 0;
  for (const industry of industries) {
    for (const useCase of useCases) {
      const page = buildPage(brandName, industry, useCase);
      writePageFile(page);
      count++;
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    count,
    routes: industries.flatMap((ind) => useCases.map((uc) => `/use-cases/${ind.key}/${uc.key}`)),
  };
  fs.writeFileSync(path.join(OUT_DIR, "_manifest.json"), stableStringify(manifest), "utf8");

  console.log(`OK Generated ${count} use-case pages into ${OUT_DIR}`);
  console.log(`OK Wrote manifest: ${path.join(OUT_DIR, "_manifest.json")}`);
}

main();
