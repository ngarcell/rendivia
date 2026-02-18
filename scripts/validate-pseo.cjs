const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "content", "pseo");
const errors = [];
const pages = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_inputs") continue;
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      pages.push(full);
    }
  }
}

walk(root);

const canonicalSet = new Set();
const relatedRefs = [];

function addError(file, message) {
  errors.push(`${file}: ${message}`);
}

const typeRules = {
  use_case: { prefix: "/use-cases/", suffix: "" },
  trigger: { prefix: "/when/", suffix: "/generate-video" },
  data_source: { prefix: "/from/", suffix: "/to/video" },
};

for (const file of pages) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    addError(file, "Invalid JSON");
    continue;
  }

  const requiredFields = ["type", "id", "canonicalUrl", "title", "metaTitle", "metaDescription", "hero", "io", "cta"];
  for (const field of requiredFields) {
    if (!(field in data)) addError(file, `Missing required field: ${field}`);
  }

  if (data.metaTitle && data.metaTitle.length > 70) addError(file, "metaTitle exceeds 70 characters");
  if (data.metaDescription && data.metaDescription.length > 160) addError(file, "metaDescription exceeds 160 characters");

  if (typeof data.canonicalUrl === "string") {
    if (!data.canonicalUrl.startsWith("/")) addError(file, "canonicalUrl must start with '/'");
    if (canonicalSet.has(data.canonicalUrl)) addError(file, `Duplicate canonicalUrl: ${data.canonicalUrl}`);
    canonicalSet.add(data.canonicalUrl);
  }

  if (data.type && typeRules[data.type]) {
    const rule = typeRules[data.type];
    if (!data.canonicalUrl.startsWith(rule.prefix)) {
      addError(file, `canonicalUrl should start with ${rule.prefix}`);
    }
    if (rule.suffix && !data.canonicalUrl.endsWith(rule.suffix)) {
      addError(file, `canonicalUrl should end with ${rule.suffix}`);
    }
  }

  if (!data.hero || !data.hero.headline || !data.hero.subheadline) {
    addError(file, "hero.headline and hero.subheadline are required");
  }

  if (!data.io || !data.io.inputJsonExample) {
    addError(file, "io.inputJsonExample is required");
  }

  if (Array.isArray(data.related)) {
    for (const rel of data.related) {
      if (rel && rel.href) relatedRefs.push({ file, href: rel.href });
    }
  }
}

for (const rel of relatedRefs) {
  if (!canonicalSet.has(rel.href)) {
    addError(rel.file, `related href not found: ${rel.href}`);
  }
}

if (errors.length) {
  console.error("pSEO validation failed:\n" + errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}

console.log(`pSEO validation passed (${pages.length} pages).`);
