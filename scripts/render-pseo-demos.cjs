require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node",
  },
  preferTsExts: true,
});

const path = require("path");
const fs = require("fs/promises");
const { existsSync } = require("fs");
const { pseoPageSchema } = require("../src/lib/pseo-schema.ts");

const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content", "pseo");

const args = process.argv.slice(2);
const getArg = (name) => {
  const item = args.find((arg) => arg.startsWith(`${name}=`));
  return item ? item.split("=").slice(1).join("=") : null;
};

const limitArg = getArg("--limit");
const limit = limitArg ? Number(limitArg) : null;
const typeFilter = getArg("--type");
const urlFilter = getArg("--url");
const skipExisting = args.includes("--skip-existing");

const DEMO_DURATION = 40;

const PALETTE = ["#2563eb", "#0ea5e9", "#22c55e", "#f97316", "#e11d48", "#8b5cf6", "#14b8a6", "#f59e0b"];

function listJsonFiles(dir) {
  const entries = require("fs").readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_")) continue;
      files.push(...listJsonFiles(resolved));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      if (entry.name.startsWith("_")) continue;
      files.push(resolved);
    }
  }
  return files;
}

function hashString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatLabel(input = "") {
  return input
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function buildBrand(page) {
  const match = page.canonicalUrl.match(/^\/use-cases\/([^/]+)\//);
  const label = match?.[1] ? formatLabel(match[1]) : "Rendivia";
  const accent = PALETTE[hashString(label) % PALETTE.length];
  return {
    name: label,
    logoUrl: null,
    colors: {
      primary: "#f8fafc",
      secondary: "#cbd5f5",
      accent,
      background: "#0f172a",
    },
    fontFamily: "Inter",
    introText: null,
    outroText: null,
  };
}

function extractMetrics(inputJson) {
  const metrics = [];
  const data = inputJson?.data;

  const pushMetric = (label, value, display) => {
    if (metrics.length >= 4) return;
    if (typeof value !== "number" || Number.isNaN(value)) return;
    metrics.push({ label: formatLabel(label), value, display: display ?? String(value) });
  };

  if (data && typeof data === "object") {
    if (data.kpis && typeof data.kpis === "object") {
      for (const [key, value] of Object.entries(data.kpis)) {
        if (typeof value === "number") pushMetric(key, value, String(value));
      }
    }

    if (metrics.length < 4) {
      for (const [key, value] of Object.entries(data)) {
        if (metrics.length >= 4) break;
        if (typeof value === "number") {
          pushMetric(key, value, String(value));
        } else if (typeof value === "string") {
          const num = Number(value.replace(/[^0-9.\\-]/g, ""));
          if (Number.isFinite(num)) {
            pushMetric(key, num, value);
          }
        }
      }
    }
  }

  if (metrics.length === 0) {
    metrics.push({ label: "Metric A", value: 42, display: "42" });
    metrics.push({ label: "Metric B", value: 30, display: "30" });
    metrics.push({ label: "Metric C", value: 18, display: "18" });
  }

  return metrics.slice(0, 4);
}

function outputForPage(page) {
  const useCaseMatch = page.canonicalUrl.match(/^\/use-cases\/([^/]+)\/([^/]+)$/);
  if (useCaseMatch) {
    const [, industry, slug] = useCaseMatch;
    const outputPath = path.join(root, "public", "pseo-demos", "use-cases", industry, `${slug}.mp4`);
    return { outputPath, videoUrl: `/pseo-demos/use-cases/${industry}/${slug}.mp4` };
  }
  const dataMatch = page.canonicalUrl.match(/^\/from\/([^/]+)\/to\/video$/);
  if (dataMatch) {
    const [, source] = dataMatch;
    const outputPath = path.join(root, "public", "pseo-demos", "data-sources", `${source}.mp4`);
    return { outputPath, videoUrl: `/pseo-demos/data-sources/${source}.mp4` };
  }
  const triggerMatch = page.canonicalUrl.match(/^\/when\/([^/]+)\/generate-video$/);
  if (triggerMatch) {
    const [, event] = triggerMatch;
    const outputPath = path.join(root, "public", "pseo-demos", "triggers", `${event}.mp4`);
    return { outputPath, videoUrl: `/pseo-demos/triggers/${event}.mp4` };
  }
  return null;
}

function buildProps(page) {
  const inputJson = page.io?.inputJsonExample ?? {};
  const templateId = inputJson.template || "weekly-summary-v1";
  return {
    title: page.title,
    subtitle: page.hero?.subheadline || "Programmatic video generated from structured data.",
    templateId,
    problem: (page.problem?.bullets || []).slice(0, 3),
    solution: (page.solution?.bullets || []).slice(0, 3),
    inputJson,
    outputBullets: (page.io?.outputBullets || []).slice(0, 3),
    steps: (page.howItWorks?.steps || []).slice(0, 4),
    metrics: extractMetrics(inputJson),
    brand: buildBrand(page),
    durationSeconds: DEMO_DURATION,
  };
}

async function loadPages() {
  const files = listJsonFiles(contentDir);
  const pages = [];
  for (const filePath of files) {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const parsed = pseoPageSchema.safeParse(data);
    if (!parsed.success) continue;
    pages.push(parsed.data);
  }
  return pages;
}

async function main() {
  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  const entryPoint = path.join(root, "src/remotion/Root.tsx");
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@": path.join(root, "src"),
      };
      return config;
    },
  });

  const pages = await loadPages();
  const filtered = pages.filter((page) => {
    if (typeFilter && page.type !== typeFilter) return false;
    if (urlFilter && !page.canonicalUrl.includes(urlFilter)) return false;
    return true;
  });
  const queued = typeof limit === "number" ? filtered.slice(0, limit) : filtered;

  console.log(`Rendering ${queued.length} pSEO demo videos...`);

  const manifest = [];

  for (const page of queued) {
    const output = outputForPage(page);
    if (!output) continue;
    if (skipExisting && existsSync(output.outputPath)) {
      manifest.push({ canonicalUrl: page.canonicalUrl, videoUrl: output.videoUrl });
      console.log(`Skip existing ${page.canonicalUrl}`);
      continue;
    }

    await fs.mkdir(path.dirname(output.outputPath), { recursive: true });
    const props = buildProps(page);
    const composition = await selectComposition({
      serveUrl,
      id: "PseoDemoVideo",
      inputProps: props,
    });
    console.log(`Rendering ${page.canonicalUrl} -> ${output.outputPath}`);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: output.outputPath,
      inputProps: props,
    });
    manifest.push({ canonicalUrl: page.canonicalUrl, videoUrl: output.videoUrl });
  }

  const manifestPath = path.join(root, "public", "pseo-demos", "manifest.json");
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), total: manifest.length, items: manifest },
      null,
      2
    )
  );

  console.log(`Done. Manifest written to ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
