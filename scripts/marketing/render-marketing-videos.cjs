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
const { getAllSlugsForStaticParams, getToolEntry } = require("../../src/data/tools.ts");
const { comparisons } = require("../../src/data/seo/comparisons.ts");

const root = path.resolve(__dirname, "../..");

const args = process.argv.slice(2);
const getArg = (name) => {
  const item = args.find((arg) => arg.startsWith(`${name}=`));
  return item ? item.split("=")[1] : null;
};

const limitArg = getArg("--limit");
const limit = limitArg ? Number(limitArg) : null;
const only = getArg("--only"); // tools | comparisons
const slugFilter = getArg("--slug");
const categoryFilter = getArg("--category");
const skipExisting = args.includes("--skip-existing");

function titleCase(value = "") {
  return value
    .split(" ")
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function truncate(value = "", max = 140) {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + "…";
}

function buildToolProps(entry, category) {
  return {
    title: titleCase(entry.primaryKeyword || entry.name),
    subtitle: truncate(entry.description, 160),
    bullets: (entry.benefits || []).slice(0, 3),
    cta: entry.cta || "Create clips",
    badge: `Rendivia · ${category}`,
    accentColor: "#2563eb",
    backgroundFrom: "#0f172a",
    backgroundTo: "#1e293b",
  };
}

function buildComparisonProps(entry) {
  return {
    title: entry.title,
    subtitle: truncate(entry.summary, 160),
    bullets: (entry.whyRendivia || []).slice(0, 3),
    cta: "Try Rendivia",
    badge: "Rendivia vs",
    accentColor: "#2563eb",
    backgroundFrom: "#0f172a",
    backgroundTo: "#1e293b",
  };
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

  const outputRoot = path.join(root, "public", "marketing-videos");
  await fs.mkdir(outputRoot, { recursive: true });

  const jobs = [];

  if (!only || only === "tools") {
    const slugs = getAllSlugsForStaticParams();
    for (const { category, slug } of slugs) {
      if (categoryFilter && category !== categoryFilter) continue;
      if (slugFilter && slug !== slugFilter) continue;
      const entry = getToolEntry(category, slug);
      if (!entry) continue;
      const outputPath = path.join(outputRoot, "tools", category, `${slug}.mp4`);
      const videoUrl = `/marketing-videos/tools/${category}/${slug}.mp4`;
      jobs.push({
        type: "tool",
        category,
        slug,
        outputPath,
        videoUrl,
        props: buildToolProps(entry, category),
      });
    }
  }

  if (!only || only === "comparisons") {
    for (const entry of comparisons) {
      if (slugFilter && entry.slug !== slugFilter) continue;
      const outputPath = path.join(outputRoot, "vs", `${entry.slug}.mp4`);
      const videoUrl = `/marketing-videos/vs/${entry.slug}.mp4`;
      jobs.push({
        type: "comparison",
        category: "vs",
        slug: entry.slug,
        outputPath,
        videoUrl,
        props: buildComparisonProps(entry),
      });
    }
  }

  const queued = typeof limit === "number" ? jobs.slice(0, limit) : jobs;
  console.log(`Rendering ${queued.length} marketing videos...`);

  const manifest = [];

  for (const job of queued) {
    if (skipExisting && existsSync(job.outputPath)) {
      manifest.push(job);
      console.log(`Skip existing ${job.type} ${job.slug}`);
      continue;
    }

    await fs.mkdir(path.dirname(job.outputPath), { recursive: true });
    const composition = await selectComposition({
      serveUrl,
      id: "MarketingVideo",
      inputProps: job.props,
    });

    console.log(`Rendering ${job.type} ${job.slug} → ${job.outputPath}`);
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: job.outputPath,
      inputProps: job.props,
    });
    manifest.push(job);
  }

  const manifestPath = path.join(outputRoot, "manifest.json");
  await fs.writeFile(
    manifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: manifest.length,
        items: manifest.map((item) => ({
          type: item.type,
          category: item.category,
          slug: item.slug,
          videoUrl: item.videoUrl,
        })),
      },
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
