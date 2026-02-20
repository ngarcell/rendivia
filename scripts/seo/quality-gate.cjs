const path = require("path");
const Module = require("module");

const root = path.join(__dirname, "..", "..");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (typeof request === "string" && request.startsWith("@/")) {
    request = path.join(root, "src", request.slice(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
  },
  preferTsExts: true,
});

const { getSeoInventory } = require("../../src/lib/seo-index-policy.ts");
const { getAllPseoPages } = require("../../src/lib/pseo.ts");
const sitemap = require("../../src/app/sitemap.ts").default;

const errors = [];

function addError(message) {
  errors.push(message);
}

function textFromPage(page) {
  const parts = [
    page.title,
    page.metaTitle,
    page.metaDescription,
    page.hero?.headline,
    page.hero?.subheadline,
    page.hero?.supportLine,
    page.problem?.title,
    ...(page.problem?.bullets || []),
    page.solution?.title,
    ...(page.solution?.bullets || []),
    page.io?.inputTitle,
    page.io?.outputTitle,
    ...(page.io?.outputBullets || []),
    page.howItWorks?.title,
    ...(page.howItWorks?.steps || []).flatMap((item) => [item.title, item.body]),
    page.benefits?.title,
    ...(page.benefits?.bullets || []),
    ...(page.faq || []).flatMap((item) => [item.q, item.a]),
    page.cta?.title,
    page.cta?.body,
  ]
    .filter(Boolean)
    .join(" ");

  return parts
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
}

function tokenSet(text) {
  return new Set(text.split(" ").filter((word) => word.length > 2));
}

function jaccard(a, b) {
  const intersection = [...a].filter((item) => b.has(item)).length;
  const union = new Set([...a, ...b]).size;
  if (union === 0) return 0;
  return intersection / union;
}

function parseBuyerIntent(pathname) {
  const match = pathname.match(/^\/use-cases\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return {
    industry: match[1],
    useCase: match[2],
    intent: match[3],
  };
}

(function main() {
  const inventory = getSeoInventory();
  const pages = getAllPseoPages();
  const pageByCanonical = new Map(pages.map((page) => [page.canonicalUrl, page]));
  const indexableSet = new Set(inventory.indexablePaths);

  if (inventory.indexablePaths.length !== 4000) {
    addError(`Indexable count is ${inventory.indexablePaths.length}, expected 4000.`);
  }

  const sitemapEntries = sitemap();
  const sitemapPaths = sitemapEntries
    .map((entry) => {
      try {
        return new URL(entry.url).pathname;
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (sitemapPaths.length !== 4000) {
    addError(`Sitemap entry count is ${sitemapPaths.length}, expected 4000.`);
  }

  const sitemapSet = new Set(sitemapPaths);
  for (const path of inventory.indexablePaths) {
    if (!sitemapSet.has(path)) {
      addError(`Indexable path missing from sitemap: ${path}`);
    }
  }
  for (const path of sitemapSet) {
    if (!indexableSet.has(path)) {
      addError(`Sitemap contains non-indexable path: ${path}`);
    }
  }

  const indexablePseoPages = pages.filter((page) => indexableSet.has(page.canonicalUrl));

  const canonicalSeen = new Set();
  const titleSeen = new Set();
  const metaSeen = new Set();
  const h1Seen = new Set();

  for (const page of indexablePseoPages) {
    if (canonicalSeen.has(page.canonicalUrl)) {
      addError(`Duplicate canonicalUrl: ${page.canonicalUrl}`);
    }
    canonicalSeen.add(page.canonicalUrl);

    const titleKey = page.title.toLowerCase().trim();
    if (titleSeen.has(titleKey)) {
      addError(`Duplicate title: ${page.title}`);
    }
    titleSeen.add(titleKey);

    const metaKey = page.metaDescription.toLowerCase().trim();
    if (metaSeen.has(metaKey)) {
      addError(`Duplicate metaDescription: ${page.canonicalUrl}`);
    }
    metaSeen.add(metaKey);

    const h1Key = page.hero?.headline?.toLowerCase().trim();
    if (h1Key) {
      if (h1Seen.has(h1Key)) {
        addError(`Duplicate H1/headline: ${page.hero.headline}`);
      }
      h1Seen.add(h1Key);
    }

    if (!page.cta?.primary?.label || !page.cta?.primary?.href) {
      addError(`Missing CTA primary on ${page.canonicalUrl}`);
    }

    const text = textFromPage(page);
    const minWords = page.type === "buyer_intent" ? 150 : 100;
    if (wordCount(text) < minWords) {
      addError(`Thin content on ${page.canonicalUrl} (under ${minWords} words)`);
    }
  }

  const buyerIntentIndexable = indexablePseoPages.filter((page) => page.type === "buyer_intent");
  for (const page of buyerIntentIndexable) {
    if (!Array.isArray(page.related) || page.related.length < 8) {
      addError(`Buyer-intent page has <8 related links: ${page.canonicalUrl}`);
      continue;
    }

    for (const rel of page.related) {
      if (!pageByCanonical.has(rel.href)) {
        addError(`Related link target missing for ${page.canonicalUrl}: ${rel.href}`);
      }
    }
  }

  const grouped = new Map();
  for (const page of buyerIntentIndexable) {
    const parsed = parseBuyerIntent(page.canonicalUrl);
    if (!parsed) continue;
    const key = `${parsed.industry}::${parsed.useCase}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(page);
  }

  const nearDuplicateThreshold = 0.94;
  for (const pagesInGroup of grouped.values()) {
    if (pagesInGroup.length < 2) continue;
    const docs = pagesInGroup.map((page) => ({
      page,
      tokens: tokenSet(textFromPage(page)),
    }));

    for (let i = 0; i < docs.length; i += 1) {
      for (let j = i + 1; j < docs.length; j += 1) {
        const similarity = jaccard(docs[i].tokens, docs[j].tokens);
        if (similarity > nearDuplicateThreshold) {
          addError(
            `Near-duplicate buyer-intent copy (${similarity.toFixed(3)}) between ${docs[i].page.canonicalUrl} and ${docs[j].page.canonicalUrl}`
          );
        }
      }
    }
  }

  if (errors.length) {
    console.error("SEO quality gate failed:\n" + errors.map((err) => `- ${err}`).join("\n"));
    process.exit(1);
  }

  console.log(
    `SEO quality gate passed (indexable=${inventory.indexablePaths.length}, sitemap=${sitemapPaths.length}, buyer-intent-indexable=${buyerIntentIndexable.length}).`
  );
})();
