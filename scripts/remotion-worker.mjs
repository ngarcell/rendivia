#!/usr/bin/env node
/**
 * Remotion render worker: polls SQS, renders on Lambda, uploads output to Supabase.
 * Supports caption jobs and template render jobs.
 * Requires env:
 * - REMOTION_AWS_REGION (default us-east-1)
 * - REMOTION_LAMBDA_FUNCTION_NAME
 * - REMOTION_SERVE_URL
 * - REMOTION_RENDER_QUEUE_URL
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * Optional:
 * - REMOTION_WEBHOOK_URL
 * - REMOTION_WEBHOOK_SECRET
 */
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { createClient } from "@supabase/supabase-js";
import { renderMediaOnLambda, getRenderProgress } from "@remotion/lambda/client";
import { downloadMedia } from "@remotion/lambda";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import os from "os";

const region = process.env.REMOTION_AWS_REGION ?? "us-east-1";
const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME;
const serveUrl = process.env.REMOTION_SERVE_URL;
const queueUrl = process.env.REMOTION_RENDER_QUEUE_URL;
const webhookUrl = process.env.REMOTION_WEBHOOK_URL;
const webhookSecret = process.env.REMOTION_WEBHOOK_SECRET;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!functionName || !serveUrl || !queueUrl || !supabaseUrl || !supabaseKey) {
  console.error("Missing required env. Check REMOTION_* and SUPABASE_* variables.");
  process.exit(1);
}

const sqs = new SQSClient({ region });
const supabase = createClient(supabaseUrl, supabaseKey);

const TEMPLATE_COMPOSITIONS = {
  "weekly-summary-v1": "DataReportVideo",
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

function createDefaultEdits(words = []) {
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
      primaryColor: "#ffffff",
      highlightColor: "#171717",
      fontFamily: "Inter",
      fontSize: 48,
      fontWeight: 600,
      textShadow: "0 2px 8px rgba(0,0,0,0.5)",
      position: "bottom",
    },
  };
}

function periodStart() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function periodEnd() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d.toISOString().slice(0, 10);
}

async function getOrCreateUsageRow(userId, teamId) {
  const start = periodStart();
  const end = periodEnd();

  let query = supabase.from("usage").select("*").eq("period_start", start);
  if (userId) query = query.eq("user_id", userId);
  else query = query.is("user_id", null);
  if (teamId) query = query.eq("team_id", teamId);
  else query = query.is("team_id", null);

  const { data } = await query.maybeSingle();
  if (data) return data;

  const insertPayload = {
    user_id: userId ?? null,
    team_id: teamId ?? null,
    period_start: start,
    period_end: end,
    videos_count: 0,
    renders_count: 0,
    api_calls_count: 0,
    render_seconds: 0,
    render_pixels: 0,
  };

  const { data: created } = await supabase.from("usage").insert(insertPayload).select("*").single();
  return created ?? insertPayload;
}

async function incrementUsageMetrics(userId, teamId, seconds, pixels) {
  const usage = await getOrCreateUsageRow(userId, teamId);
  const start = periodStart();
  const nextSeconds = Number(usage.render_seconds ?? 0) + Math.max(0, seconds);
  const nextPixels = Number(usage.render_pixels ?? 0) + Math.max(0, pixels);

  let updateQ = supabase
    .from("usage")
    .update({
      render_seconds: nextSeconds,
      render_pixels: nextPixels,
      updated_at: new Date().toISOString(),
    })
    .eq("period_start", start);
  if (userId) updateQ = updateQ.eq("user_id", userId);
  else updateQ = updateQ.is("user_id", null);
  if (teamId) updateQ = updateQ.eq("team_id", teamId);
  else updateQ = updateQ.is("team_id", null);
  await updateQ;
}

function buildSignature(payload, secret) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload, "utf8");
  return `sha256=${hmac.digest("hex")}`;
}

async function sendWebhook(url, secret, payload, attempts = 3) {
  const body = JSON.stringify(payload);
  const headers = { "content-type": "application/json" };
  if (secret) {
    headers["x-rendivia-signature"] = buildSignature(body, secret);
  }

  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
      });
      if (!res.ok) {
        throw new Error(`Webhook status ${res.status}`);
      }
      return { ok: true };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      const delay = 1000 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return { ok: false, error: lastError ?? "Webhook failed" };
}

async function waitForRender(renderId, bucketName) {
  let done = false;
  while (!done) {
    const progress = await getRenderProgress({
      region,
      renderId,
      bucketName,
      functionName,
    });

    if (progress.fatalErrorEncountered) {
      throw new Error(progress.errors?.[0]?.message ?? "Render failed");
    }

    if (progress.done) {
      done = true;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

async function processCaptionJob(jobId) {
  try {
    const { data: job, error } = await supabase
      .from("caption_jobs")
      .select("id, user_id, video_url, segments, edits")
      .eq("id", jobId)
      .single();

    if (error || !job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const segments = Array.isArray(job.segments) ? job.segments : [];
    const edits = job.edits && typeof job.edits === "object" ? job.edits : createDefaultEdits(segments);

    const inputProps = {
      captions: edits.captions,
      timeline: edits.timeline,
      style: edits.style,
      aspectRatio: edits.aspectRatio ?? "9:16",
      videoSrc: job.video_url,
    };

    const render = await renderMediaOnLambda({
      region,
      functionName,
      serveUrl,
      composition: "CaptionVideo",
      inputProps,
      codec: "h264",
      privacy: "public",
      webhook: webhookUrl
        ? {
            url: webhookUrl,
            secret: webhookSecret,
            customData: { jobId },
          }
        : undefined,
    });

    await supabase
      .from("caption_jobs")
      .update({
        render_id: render.renderId,
        render_status: "rendering",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    await waitForRender(render.renderId, render.bucketName);

    const outPath = path.join(os.tmpdir(), `rendivia-${jobId}-${Date.now()}.mp4`);
    await downloadMedia({
      region,
      renderId: render.renderId,
      bucketName: render.bucketName,
      outPath,
    });

    const outputBuffer = await fs.readFile(outPath);
    const outputStoragePath = `${job.user_id}/caption-${jobId}.mp4`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(outputStoragePath, outputBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    await fs.unlink(outPath).catch(() => {});

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("uploads").getPublicUrl(outputStoragePath);

    await supabase
      .from("caption_jobs")
      .update({
        output_url: publicUrl,
        status: "completed",
        render_status: "completed",
        rendered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    console.log(`Caption render complete: ${jobId}`);
  } catch (err) {
    console.error(`Caption render failed for ${jobId}:`, err);
    await supabase
      .from("caption_jobs")
      .update({
        render_status: "failed",
        render_error: err instanceof Error ? err.message : "Render failed",
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    throw err;
  }
}

async function processTemplateJob(renderJobId) {
  let job;
  try {
    const { data, error } = await supabase
      .from("render_jobs")
      .select(
        "id, user_id, team_id, template_id, template_version, input_props, status, webhook_url, webhook_secret, duration_seconds, resolution"
      )
      .eq("id", renderJobId)
      .single();

    if (error || !data) {
      throw new Error(`Render job not found: ${renderJobId}`);
    }
    job = data;

    const composition = TEMPLATE_COMPOSITIONS[job.template_id];
    if (!composition) {
      throw new Error(`Unknown template: ${job.template_id}`);
    }

    const inputProps = job.input_props && typeof job.input_props === "object" ? job.input_props : {};

    const render = await renderMediaOnLambda({
      region,
      functionName,
      serveUrl,
      composition,
      inputProps,
      codec: "h264",
      privacy: "public",
    });

    await supabase
      .from("render_jobs")
      .update({
        render_id: render.renderId,
        status: "rendering",
        updated_at: new Date().toISOString(),
      })
      .eq("id", renderJobId);

    await waitForRender(render.renderId, render.bucketName);

    const outPath = path.join(os.tmpdir(), `rendivia-template-${renderJobId}-${Date.now()}.mp4`);
    await downloadMedia({
      region,
      renderId: render.renderId,
      bucketName: render.bucketName,
      outPath,
    });

    const outputBuffer = await fs.readFile(outPath);
    const outputStoragePath = `${job.user_id}/render-${renderJobId}.mp4`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(outputStoragePath, outputBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    await fs.unlink(outPath).catch(() => {});

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("uploads").getPublicUrl(outputStoragePath);

    await supabase
      .from("render_jobs")
      .update({
        output_url: publicUrl,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", renderJobId);

    const durationSeconds = Number(job.duration_seconds ?? 0);
    let pixels = 0;
    if (job.resolution && typeof job.resolution === "string") {
      const match = job.resolution.match(/(\\d+)x(\\d+)/);
      if (match) {
        pixels = Number(match[1]) * Number(match[2]);
      }
    }
    if (durationSeconds > 0 || pixels > 0) {
      await incrementUsageMetrics(job.user_id, job.team_id, durationSeconds, pixels);
    }

    if (job.webhook_url) {
      const payload = {
        jobId: renderJobId,
        status: "completed",
        outputUrl: publicUrl,
        template: job.template_id,
        version: job.template_version,
      };
      const result = await sendWebhook(job.webhook_url, job.webhook_secret, payload);
      await supabase
        .from("render_jobs")
        .update({
          webhook_status: result.ok ? "sent" : "failed",
          webhook_error: result.ok ? null : result.error ?? "Webhook failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", renderJobId);
    }

    console.log(`Template render complete: ${renderJobId}`);
  } catch (err) {
    console.error(`Template render failed for ${renderJobId}:`, err);
    await supabase
      .from("render_jobs")
      .update({
        status: "failed",
        render_error: err instanceof Error ? err.message : "Render failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", renderJobId);

    if (job?.webhook_url) {
      const payload = {
        jobId: renderJobId,
        status: "failed",
        error: err instanceof Error ? err.message : "Render failed",
        template: job.template_id,
        version: job.template_version,
      };
      const result = await sendWebhook(job.webhook_url, job.webhook_secret, payload);
      await supabase
        .from("render_jobs")
        .update({
          webhook_status: result.ok ? "sent" : "failed",
          webhook_error: result.ok ? null : result.error ?? "Webhook failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", renderJobId);
    }

    throw err;
  }
}

async function loop() {
  console.log("Remotion worker started...");
  while (true) {
    const res = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 900,
      })
    );

    if (!res.Messages || res.Messages.length === 0) {
      continue;
    }

    for (const message of res.Messages) {
      if (!message.Body) continue;
      try {
        const payload = JSON.parse(message.Body);
        if (payload.jobType === "template") {
          if (!payload.renderJobId) throw new Error("Missing renderJobId in message");
          await processTemplateJob(payload.renderJobId);
        } else {
          if (!payload.jobId) throw new Error("Missing jobId in message");
          await processCaptionJob(payload.jobId);
        }
        if (message.ReceiptHandle) {
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: queueUrl,
              ReceiptHandle: message.ReceiptHandle,
            })
          );
        }
      } catch (err) {
        console.error("Render job failed:", err);
      }
    }
  }
}

loop().catch((e) => {
  console.error(e);
  process.exit(1);
});
