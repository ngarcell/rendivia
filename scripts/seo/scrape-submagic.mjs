import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const SITEMAP_INDEX = "https://www.submagic.co/sitemap.xml";
const OUTPUT_DIR = path.resolve("scripts/seo/output");
const USER_AGENT = "RendiviaSEO/1.0 (+https://rendivia.example.com)";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, attempt = 1) {
  const res = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    if (attempt < 3) {
      await sleep(500 * attempt);
      return fetchText(url, attempt + 1);
    }
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.text();
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function parseSitemapIndex(url) {
  const xml = await fetchText(url);
  const data = parser.parse(xml);
  const sitemaps = asArray(data?.sitemapindex?.sitemap).map((entry) => entry.loc);
  return sitemaps.filter(Boolean);
}

async function parseUrlset(url) {
  const xml = await fetchText(url);
  const data = parser.parse(xml);
  const urls = asArray(data?.urlset?.url).map((entry) => entry.loc);
  return urls.filter(Boolean);
}

function inferLocales(sitemapUrls) {
  const locales = new Set();
  for (const loc of sitemapUrls) {
    const match = loc.match(/\/([a-z]{2}(?:-[a-z]{2})?)\/sitemap\.xml/i);
    if (match) locales.add(match[1].toLowerCase());
  }
  return locales;
}

function classifyUrl(url, localeSet) {
  const u = new URL(url);
  const segments = u.pathname.split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();
  const hasLocale = first && localeSet.has(first);
  const locale = hasLocale ? first : "root";
  const effectiveSegments = hasLocale ? segments.slice(1) : segments;
  const effectivePath = `/${effectiveSegments.join("/")}`;
  const prefix = segments.length === 0 ? "/" : `/${segments.slice(0, Math.min(2, segments.length)).join("/")}`;

  let type = "other";
  if (effectiveSegments[0] === "vs") type = "vs";
  else if (effectiveSegments[0] === "alternative" || effectiveSegments[0] === "alternatives") type = "alternative";
  else if (effectiveSegments[0] === "blog") type = "blog";
  else if (effectiveSegments[0] === "tools") type = "tools";
  else if (effectivePath.match(/\b(pricing|prijzen|preise|precios|prezzi|cennik)\b/)) type = "pricing";
  else if (effectiveSegments[0] === "affiliate") type = "affiliate";

  return { locale, type, prefix };
}

function toCsv(rows, headers) {
  const escape = (value) => {
    const string = value == null ? "" : String(value);
    if (/[",\n]/.test(string)) return `"${string.replace(/"/g, '""')}"`;
    return string;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const sitemapUrls = await parseSitemapIndex(SITEMAP_INDEX);
  if (sitemapUrls.length === 0) {
    throw new Error("No sitemap URLs found in index.");
  }

  const localeSet = inferLocales(sitemapUrls);

  const allUrls = [];
  for (const sitemapUrl of sitemapUrls) {
    const urls = await parseUrlset(sitemapUrl);
    allUrls.push(...urls);
  }

  const deduped = Array.from(new Set(allUrls)).sort();

  const rows = deduped.map((url) => {
    const { locale, type, prefix } = classifyUrl(url, localeSet);
    return { url, locale, type, prefix };
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    totalUrls: rows.length,
    locales: {},
    types: {},
    prefixes: {},
    sampleByType: {},
  };

  for (const row of rows) {
    summary.locales[row.locale] = (summary.locales[row.locale] || 0) + 1;
    summary.types[row.type] = (summary.types[row.type] || 0) + 1;
    summary.prefixes[row.prefix] = (summary.prefixes[row.prefix] || 0) + 1;
    if (!summary.sampleByType[row.type]) summary.sampleByType[row.type] = [];
    if (summary.sampleByType[row.type].length < 5) summary.sampleByType[row.type].push(row.url);
  }

  const urlsJsonPath = path.join(OUTPUT_DIR, "submagic-urls.json");
  const urlsCsvPath = path.join(OUTPUT_DIR, "submagic-urls.csv");
  const summaryJsonPath = path.join(OUTPUT_DIR, "submagic-summary.json");
  const summaryCsvPath = path.join(OUTPUT_DIR, "submagic-summary.csv");
  const urlsSqlPath = path.join(OUTPUT_DIR, "submagic-urls.sql");

  await fs.writeFile(urlsJsonPath, JSON.stringify(rows, null, 2));
  await fs.writeFile(urlsCsvPath, toCsv(rows, ["url", "locale", "type", "prefix"]));
  await fs.writeFile(summaryJsonPath, JSON.stringify(summary, null, 2));

  const summaryRows = [];
  const pushSummary = (dimension, obj) => {
    for (const [key, count] of Object.entries(obj)) {
      summaryRows.push({ dimension, key, count });
    }
  };
  pushSummary("locale", summary.locales);
  pushSummary("type", summary.types);
  pushSummary("prefix", summary.prefixes);

  await fs.writeFile(summaryCsvPath, toCsv(summaryRows, ["dimension", "key", "count"]));

  const escapeSql = (value) => String(value).replace(/'/g, "''");
  const sqlHeader = [
    "CREATE TABLE IF NOT EXISTS submagic_urls (",
    "  url TEXT PRIMARY KEY,",
    "  locale TEXT NOT NULL,",
    "  type TEXT NOT NULL,",
    "  prefix TEXT NOT NULL",
    ");",
    "DELETE FROM submagic_urls;",
  ].join("\n");
  const sqlValues = rows
    .map((row) => `('${escapeSql(row.url)}','${escapeSql(row.locale)}','${escapeSql(row.type)}','${escapeSql(row.prefix)}')`)
    .join(",\n");
  const sqlBody = `INSERT INTO submagic_urls (url, locale, type, prefix) VALUES\n${sqlValues};\n`;
  await fs.writeFile(urlsSqlPath, `${sqlHeader}\n${sqlBody}`);

  console.log(`Saved ${rows.length} URLs to ${urlsJsonPath}`);
  console.log(`Saved summary to ${summaryJsonPath}`);
  console.log(`Saved SQL dump to ${urlsSqlPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
