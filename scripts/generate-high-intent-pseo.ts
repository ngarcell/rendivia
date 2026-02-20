import * as fs from "node:fs";
import * as path from "node:path";

type CTA = { label: string; href: string };

type IndustryInput = {
  key: string;
  label: string;
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
  faq: Array<{ q: string; a: string }>;
};

type IntentInput = {
  key: string;
  label: string;
  primaryKeyword: string;
  intentWeight: number;
  commercialAngle: string;
  painPoints: string[];
  executionBullets: string[];
  proofBullets: string[];
  ctaLabel: string;
};

type PseoPage = {
  type: "buyer_intent";
  version: 1;
  id: string;
  canonicalUrl: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string;
  cluster: "buyer-intent";
  intentSlug: string;
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    supportLine: string;
    primaryCta: CTA;
    secondaryCta: CTA;
  };
  problem: { title: string; bullets: string[] };
  solution: { title: string; bullets: string[] };
  io: {
    inputTitle: string;
    inputJsonExample: Record<string, unknown>;
    outputTitle: string;
    outputBullets: string[];
  };
  howItWorks: {
    title: string;
    steps: Array<{ title: string; body: string }>;
  };
  benefits: {
    title: string;
    bullets: string[];
  };
  faq: Array<{ q: string; a: string }>;
  related: Array<{ label: string; href: string }>;
  cta: {
    title: string;
    body: string;
    primary: CTA;
  };
};

type PriorityInput = {
  fallbackLastUpdated?: string;
  intentOrder?: string[];
};

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "content", "pseo", "_inputs");
const OUT_DIR = path.join(ROOT, "content", "pseo", "buyer-intent");

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
      for (const key of keys) {
        out[key] = sorter((value as Record<string, unknown>)[key]);
      }
      return out;
    }
    return value;
  };
  return `${JSON.stringify(sorter(obj), null, 2)}\n`;
}

function toLabel(input: string): string {
  return input
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function metricPair(industry: IndustryInput): string {
  const first = industry.exampleMetrics[0]?.label ?? "core KPIs";
  const second = industry.exampleMetrics[1]?.label ?? "trend metrics";
  return `${first} and ${second}`;
}

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function buildInputExample(
  industry: IndustryInput,
  useCase: UseCaseInput,
  intent: IntentInput
): Record<string, unknown> {
  const metrics = industry.exampleMetrics.slice(0, 4);
  const kpis: Record<string, unknown> = {};
  for (const metric of metrics) {
    kpis[metric.key] = metric.example;
  }

  return {
    template: useCase.templateId,
    intent: intent.key,
    data: {
      industry: industry.key,
      workflow: useCase.key,
      kpis,
      highlight: pick(industry.coreEntities, 0),
      narrative: `${industry.label} ${useCase.label.toLowerCase()} execution update`,
      trigger: useCase.trigger.key,
    },
    brand: industry.key,
  };
}

function buildRelated(
  industries: IndustryInput[],
  useCases: UseCaseInput[],
  intents: IntentInput[],
  industry: IndustryInput,
  useCase: UseCaseInput,
  intent: IntentInput
) {
  const links: Array<{ label: string; href: string }> = [];

  for (const siblingIntent of intents) {
    if (siblingIntent.key === intent.key) continue;
    links.push({
      label: `${useCase.label} ${siblingIntent.label.toLowerCase()} for ${industry.label}`,
      href: `/use-cases/${industry.key}/${useCase.key}/${siblingIntent.key}`,
    });
  }

  const sameIndustry = useCases.filter((item) => item.key !== useCase.key).slice(0, 3);
  for (const altUseCase of sameIndustry) {
    links.push({
      label: `${altUseCase.label} ${intent.label.toLowerCase()} for ${industry.label}`,
      href: `/use-cases/${industry.key}/${altUseCase.key}/${intent.key}`,
    });
  }

  const sameUseCase = industries.filter((item) => item.key !== industry.key).slice(0, 3);
  for (const altIndustry of sameUseCase) {
    links.push({
      label: `${useCase.label} ${intent.label.toLowerCase()} for ${altIndustry.label}`,
      href: `/use-cases/${altIndustry.key}/${useCase.key}/${intent.key}`,
    });
  }

  return links.slice(0, 8);
}

function buildFaq(
  industry: IndustryInput,
  useCase: UseCaseInput,
  intent: IntentInput
): Array<{ q: string; a: string }> {
  const base = useCase.faq.slice(0, 2).map((item) => ({
    q: `${item.q} (${intent.label.toLowerCase()})`,
    a: item.a,
  }));

  base.push({
    q: `Why is ${intent.primaryKeyword} relevant for ${industry.label} teams?`,
    a: `${industry.label} teams use ${intent.primaryKeyword} to automate ${useCase.label.toLowerCase()} without manual editing bottlenecks.`,
  });

  return base;
}

function buildPage(
  industries: IndustryInput[],
  useCases: UseCaseInput[],
  intents: IntentInput[],
  industry: IndustryInput,
  useCase: UseCaseInput,
  intent: IntentInput,
  lastUpdated: string
): PseoPage {
  const canonicalUrl = `/use-cases/${industry.key}/${useCase.key}/${intent.key}`;
  const intentLabel = intent.label.toLowerCase();
  const title = `${useCase.label} ${intentLabel} for ${industry.label}`;

  return {
    type: "buyer_intent",
    version: 1,
    id: `buyer_intent.${industry.key}.${useCase.key}.${intent.key}`,
    canonicalUrl,
    title,
    metaTitle: `${toLabel(intent.key)} for ${industry.label} ${useCase.label} | Rendivia`,
    metaDescription: `Compare ${intent.primaryKeyword} options for ${industry.label}. Run ${useCase.label.toLowerCase()} with deterministic templates, webhooks, and paid-trial readiness.`,
    lastUpdated,
    cluster: "buyer-intent",
    intentSlug: intent.key,
    hero: {
      eyebrow: "High-intent workflow",
      headline: title,
      subheadline: `${intent.commercialAngle}. Built for ${industry.label} teams running ${useCase.label.toLowerCase()}.`,
      supportLine: `Operational fit: ${metricPair(industry)} with ${useCase.trigger.label.toLowerCase()}.`,
      primaryCta: { label: intent.ctaLabel, href: "/dashboard" },
      secondaryCta: { label: "View pricing", href: "/pricing" },
    },
    problem: {
      title: `Why ${industry.label} buyers look for ${intent.primaryKeyword}`,
      bullets: [
        ...intent.painPoints,
        pick(industry.problemBullets, 0),
      ],
    },
    solution: {
      title: `Execution plan for ${useCase.label.toLowerCase()} (${intentLabel})`,
      bullets: [
        ...intent.executionBullets,
        `Use ${useCase.templateId} to keep output deterministic across ${industry.label} workflows.`,
      ],
    },
    io: {
      inputTitle: "Input (commercially-ready JSON)",
      inputJsonExample: buildInputExample(industry, useCase, intent),
      outputTitle: "Output (production MP4 + webhook)",
      outputBullets: [
        ...useCase.outputBullets.slice(0, 3),
        `Delivery targets: ${industry.deliveryExamples.join(", ")} for ${industry.label.toLowerCase()} stakeholders.`,
      ],
    },
    howItWorks: {
      title: "Implementation sequence",
      steps: [
        {
          title: "Qualify workflow",
          body: `Map ${useCase.label.toLowerCase()} requirements to ${intent.primaryKeyword} buying criteria.`,
        },
        ...useCase.howItWorksSteps.slice(0, 2),
        {
          title: "Pilot and scale",
          body: "Launch a paid trial workflow, validate output quality, then expand to recurring automation.",
        },
      ],
    },
    benefits: {
      title: "Commercial outcomes",
      bullets: [
        ...intent.proofBullets,
        ...industry.benefitBullets.slice(0, 2),
      ],
    },
    faq: buildFaq(industry, useCase, intent),
    related: buildRelated(industries, useCases, intents, industry, useCase, intent),
    cta: {
      title: `Launch ${useCase.label.toLowerCase()} with ${intent.primaryKeyword}`,
      body: `Start a paid trial and ship a deterministic ${useCase.label.toLowerCase()} workflow for ${industry.label}.`,
      primary: { label: intent.ctaLabel, href: "/dashboard" },
    },
  };
}

function main() {
  const industries = readJsonFile<IndustryInput[]>(path.join(INPUT_DIR, "industries.json"));
  const useCases = readJsonFile<UseCaseInput[]>(path.join(INPUT_DIR, "useCases.json"));
  const intents = readJsonFile<IntentInput[]>(path.join(INPUT_DIR, "intents.json"));
  const priority = readJsonFile<PriorityInput>(path.join(INPUT_DIR, "index-priority.json"));

  ensureDir(OUT_DIR);

  const lastUpdated =
    process.env.PSEO_LAST_UPDATED ||
    priority.fallbackLastUpdated ||
    "2026-02-20";

  let count = 0;
  for (const industry of industries) {
    for (const useCase of useCases) {
      for (const intent of intents) {
        const page = buildPage(industries, useCases, intents, industry, useCase, intent, lastUpdated);
        const fileName = `${industry.key}.${useCase.key}.${intent.key}.json`;
        const outPath = path.join(OUT_DIR, fileName);
        fs.writeFileSync(outPath, stableStringify(page), "utf8");
        count += 1;
      }
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    count,
    intents: intents.map((item) => ({ key: item.key, weight: item.intentWeight })),
    routes: industries.flatMap((industry) =>
      useCases.flatMap((useCase) =>
        intents.map((intent) => `/use-cases/${industry.key}/${useCase.key}/${intent.key}`)
      )
    ),
  };

  fs.writeFileSync(path.join(OUT_DIR, "_manifest.json"), stableStringify(manifest), "utf8");

  console.log(`OK Generated ${count} buyer-intent pages in ${OUT_DIR}`);
}

main();
