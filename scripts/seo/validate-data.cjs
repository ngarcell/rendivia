require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
  },
  preferTsExts: true,
});

const { comparisons } = require("../../src/data/seo/comparisons.ts");
const { competitors } = require("../../src/data/seo/competitors.ts");

const errors = [];
const warnings = [];

function requireString(value, label) {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    errors.push(`Missing ${label}`);
  }
}

function requireList(value, label, min = 1) {
  if (!Array.isArray(value) || value.length < min) {
    errors.push(`Missing ${label} (min ${min})`);
  }
}

const competitorSlugs = new Set();
for (const competitor of competitors) {
  requireString(competitor.slug, `competitor.slug for ${competitor.name || "unknown"}`);
  requireString(competitor.name, `competitor.name for ${competitor.slug || "unknown"}`);
  requireString(competitor.category, `competitor.category for ${competitor.slug || "unknown"}`);
  requireString(competitor.homepage, `competitor.homepage for ${competitor.slug || "unknown"}`);
  requireString(competitor.shortDescription, `competitor.shortDescription for ${competitor.slug || "unknown"}`);
  if (competitorSlugs.has(competitor.slug)) {
    errors.push(`Duplicate competitor slug: ${competitor.slug}`);
  }
  competitorSlugs.add(competitor.slug);
}

const comparisonSlugs = new Set();
for (const entry of comparisons) {
  requireString(entry.slug, "comparison.slug");
  requireString(entry.title, `comparison.title for ${entry.slug}`);
  requireString(entry.primaryKeyword, `comparison.primaryKeyword for ${entry.slug}`);
  requireString(entry.summary, `comparison.summary for ${entry.slug}`);
  requireString(entry.intro, `comparison.intro for ${entry.slug}`);
  requireString(entry.pricingNote, `comparison.pricingNote for ${entry.slug}`);
  requireList(entry.whyRendivia, `comparison.whyRendivia for ${entry.slug}`, 3);
  requireList(entry.featureMatrix, `comparison.featureMatrix for ${entry.slug}`, 5);
  requireList(entry.pros?.rendivia, `comparison.pros.rendivia for ${entry.slug}`, 3);
  requireList(entry.pros?.competitor, `comparison.pros.competitor for ${entry.slug}`, 3);
  requireList(entry.cons?.rendivia, `comparison.cons.rendivia for ${entry.slug}`, 2);
  requireList(entry.cons?.competitor, `comparison.cons.competitor for ${entry.slug}`, 2);
  requireList(entry.useCases?.rendivia, `comparison.useCases.rendivia for ${entry.slug}`, 2);
  requireList(entry.useCases?.competitor, `comparison.useCases.competitor for ${entry.slug}`, 2);
  requireList(entry.faqs, `comparison.faqs for ${entry.slug}`, 5);

  if (!entry.competitor || !entry.competitor.slug || !competitorSlugs.has(entry.competitor.slug)) {
    errors.push(`Comparison ${entry.slug} references unknown competitor ${entry.competitor?.slug || "unknown"}`);
  }

  if (comparisonSlugs.has(entry.slug)) {
    errors.push(`Duplicate comparison slug: ${entry.slug}`);
  }
  comparisonSlugs.add(entry.slug);

  if (entry.faqs && entry.faqs.length > 8) {
    warnings.push(`Comparison ${entry.slug} has ${entry.faqs.length} FAQs (consider 5-8).`);
  }
}

if (warnings.length > 0) {
  console.warn("Warnings:\n" + warnings.map((w) => `- ${w}`).join("\n"));
}

if (errors.length > 0) {
  console.error("Errors:\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}

console.log("SEO data validation passed.");
