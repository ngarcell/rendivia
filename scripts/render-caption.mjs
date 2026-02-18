#!/usr/bin/env node
/**
 * Standalone Remotion render for a caption job.
 * Usage: node scripts/render-caption.mjs <jobId>
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * Run from project root. Install deps first: npm install
 */
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const jobId = process.argv[2];
if (!jobId) {
  console.error("Usage: node scripts/render-caption.mjs <jobId>");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_BRAND = {
  primaryColor: "#ffffff",
  highlightColor: "#171717",
  fontFamily: "Inter",
  fontSize: 48,
  fontWeight: 600,
  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
};

function wordSegmentsToCaptions(words = []) {
  return words.map((w, i) => {
    const startMs = Math.max(0, Math.round(w.start * 1000));
    const endMs = Math.max(startMs + 1, Math.round(w.end * 1000));
    return {
      text: `${i === 0 ? "" : " "}${w.word}`,
      startMs,
      endMs,
      timestampMs: Math.round((startMs + endMs) / 2),
      confidence: null,
    };
  });
}

function createDefaultEdits(words = [], brand = DEFAULT_BRAND) {
  const lastEnd = words.length > 0 ? Math.max(...words.map((w) => w.end)) : 1;
  return {
    version: 1,
    aspectRatio: "9:16",
    timeline: [
      {
        id: "clip-1",
        start: 0,
        end: Math.max(1, lastEnd + 0.5),
      },
    ],
    captions: wordSegmentsToCaptions(words),
    style: {
      primaryColor: brand.primaryColor,
      highlightColor: brand.highlightColor,
      fontFamily: brand.fontFamily,
      fontSize: brand.fontSize,
      fontWeight: brand.fontWeight,
      textShadow: brand.textShadow,
      position: "bottom",
    },
  };
}

async function main() {
  const { data: job, error: fetchError } = await supabase
    .from("caption_jobs")
    .select("id, user_id, video_url, segments, edits")
    .eq("id", jobId)
    .single();

  if (fetchError || !job) {
    console.error("Job not found:", jobId);
    process.exit(1);
  }

  const segments = Array.isArray(job.segments) ? job.segments : [];
  const edits = job.edits && typeof job.edits === "object" ? job.edits : createDefaultEdits(segments);

  const entryPoint = path.join(root, "src/remotion/Root.tsx");
  console.log("Bundling Remotion...");
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (c) => c,
  });

  const inputProps = {
    captions: edits.captions,
    timeline: edits.timeline,
    style: edits.style,
    aspectRatio: edits.aspectRatio ?? "9:16",
    videoSrc: job.video_url,
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "CaptionVideo",
    inputProps,
  });

  const outDir = path.join(root, "out");
  await fs.mkdir(outDir, { recursive: true });
  const outputPath = path.join(outDir, `caption-${jobId}-${Date.now()}.mp4`);

  console.log("Rendering...");
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
  });

  const outputBuffer = await fs.readFile(outputPath);
  const outputStoragePath = `${job.user_id}/caption-${jobId}.mp4`;

  const { error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(outputStoragePath, outputBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  await fs.unlink(outputPath).catch(() => {});

  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    await supabase
      .from("caption_jobs")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", jobId);
    process.exit(1);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("uploads").getPublicUrl(outputStoragePath);

  await supabase
    .from("caption_jobs")
    .update({
      output_url: publicUrl,
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  console.log("Done:", publicUrl);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
