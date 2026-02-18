require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
  },
  preferTsExts: true,
});

const {
  getAllSlugsForStaticParams,
  getToolEntry,
} = require("../../src/data/tools.ts");

const REQUIRED_KEYWORDS = [
  /rendivia/i,
  /caption/i,
  /clip/i,
  /short-form/i,
  /long-form/i,
  /remotion/i,
  /whisper/i,
];

const PLACEHOLDER_PATTERNS = [/lorem/i, /placeholder/i, /tbd/i, /todo/i];

function flattenEntry(entry) {
  return [
    entry.name,
    entry.primaryKeyword,
    entry.description,
    entry.intro,
    entry.cta,
    ...(entry.benefits || []),
    ...(entry.howToSteps || []),
    ...(entry.faqs || []).flatMap((faq) => [faq.question, faq.answer]),
  ]
    .filter(Boolean)
    .join(" ");
}

const errors = [];
const warnings = [];

const slugs = getAllSlugsForStaticParams();
for (const { category, slug } of slugs) {
  const entry = getToolEntry(category, slug);
  if (!entry) {
    errors.push(`Missing tool entry for ${category}/${slug}`);
    continue;
  }

  const text = flattenEntry(entry);
  const keywordHit = REQUIRED_KEYWORDS.some((regex) => regex.test(text));
  if (!keywordHit) {
    errors.push(`Missing product keywords in ${category}/${slug}`);
  }

  const placeholderHit = PLACEHOLDER_PATTERNS.find((regex) => regex.test(text));
  if (placeholderHit) {
    errors.push(`Placeholder copy found in ${category}/${slug}`);
  }

  if (!entry.benefits || entry.benefits.length < 3) {
    warnings.push(`Low benefits count for ${category}/${slug}`);
  }

  if (!entry.faqs || entry.faqs.length < 2) {
    warnings.push(`Low FAQ count for ${category}/${slug}`);
  }
}

if (warnings.length > 0) {
  console.warn("Warnings:\n" + warnings.map((w) => `- ${w}`).join("\n"));
}

if (errors.length > 0) {
  console.error("Errors:\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}

console.log(`Tools PSEO validation passed for ${slugs.length} entries.`);
