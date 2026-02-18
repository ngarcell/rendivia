import { createServerClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { parseWhisperSegments } from "@/remotion/WordSegment";
import { DEFAULT_BRAND_PRESET } from "@/lib/brand-preset";
import { createDefaultEdits } from "@/lib/caption-edits";
import {
  getSubscriptionPlanId,
  getOrCreateUsage,
  incrementUsage,
  checkLimit,
} from "@/lib/usage";
import { canUseFeature, getPlan } from "@/lib/plans";
import { extractBrandFromUrl } from "@/lib/brand-from-url";
import {
  trimSilenceFromSegments,
  segmentsToWordSegments,
} from "@/lib/trim-silence";

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is missing");
  return new OpenAI({ apiKey: key });
}

export async function runCaptionPipeline(
  request: Request,
  userId: string,
  teamId?: string | null
): Promise<{ status: number; body: unknown }> {
  try {
    const planId = await getSubscriptionPlanId(userId, teamId ?? null);
    const plan = getPlan(planId);
    const usage = await getOrCreateUsage(userId, teamId ?? null);
    const withinLimit = await checkLimit(
      planId,
      "videos",
      usage.videosCount
    );
    if (!withinLimit) {
      return {
        status: 403,
        body: {
          error: `Plan limit reached (${plan.limits.videosPerMonth} videos/month). Upgrade to continue.`,
        },
      };
    }

    const formData = await request.formData();
    const file = formData.get("video") as File | null;
    const videoUrl = formData.get("videoUrl") as string | null;
    if ((!file || !file.size) && !videoUrl) {
      return {
        status: 400,
        body: { error: "Missing video file or URL" },
      };
    }

    const trimSilence = formData.get("trimSilence") === "true";
    const brandUrl = formData.get("brandUrl") as string | null;

    if (trimSilence && !canUseFeature(planId, "trimSilence")) {
      return {
        status: 403,
        body: { error: "Trim silence is available on Pro and above" },
      };
    }
    if (brandUrl && !canUseFeature(planId, "brandFromUrl")) {
      return {
        status: 403,
        body: { error: "Brand-from-URL is available on Pro and above" },
      };
    }

    let buffer: Buffer | null = null;
    let fileName = file?.name ?? "video.mp4";
    let fileType = file?.type ?? "video/mp4";
    if (!file || !file.size) {
      try {
        const res = await fetch(videoUrl as string);
        if (!res.ok) {
          return {
            status: 400,
            body: { error: "Failed to fetch video URL" },
          };
        }
        buffer = Buffer.from(await res.arrayBuffer());
        fileType = res.headers.get("content-type") ?? "video/mp4";
        try {
          const parsed = new URL(videoUrl as string);
          const last = parsed.pathname.split("/").pop();
          if (last) fileName = last;
        } catch {
          // ignore
        }
      } catch {
        return {
          status: 400,
          body: { error: "Failed to download video URL" },
        };
      }
    }

    const maxDurationMinutes = plan.limits.maxVideoDurationMinutes;
    const sizeBytes = buffer ? buffer.length : file?.size ?? 0;
    if (maxDurationMinutes > 0) {
      const estimatedMinutes = sizeBytes / (1024 * 1024);
      if (estimatedMinutes > maxDurationMinutes) {
        return {
          status: 400,
          body: {
            error: `Video exceeds plan max duration (${maxDurationMinutes} min)`,
          },
        };
      }
    }

    let brand = DEFAULT_BRAND_PRESET;
    if (brandUrl) {
      try {
        const extracted = await extractBrandFromUrl(brandUrl);
        brand = extracted.brand;
      } catch (e) {
        console.warn("Brand-from-URL failed, using default:", e);
      }
    }

    const supabase = createServerClient();
    const bucket = "uploads";
    const safeName = fileName.replace(/\\s+/g, "-");
    const path = `${userId}/${Date.now()}-${safeName}`;
    if (!buffer && file) {
      buffer = Buffer.from(await file.arrayBuffer());
    }
    if (!buffer) {
      return { status: 400, body: { error: "Missing video data" } };
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadError) {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some((b) => b.name === bucket)) {
        return {
          status: 502,
          body: {
            error: `Create a Supabase Storage bucket named "${bucket}" (public or with RLS)`,
          },
        };
      }
      return {
        status: 502,
        body: { error: "Upload failed", details: uploadError.message },
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: job, error: insertError } = await (supabase as any)
      .from("caption_jobs")
      .insert({
        user_id: userId,
        video_url: publicUrl,
        status: "transcribing",
        plan_id: planId,
        options: { trimSilence, brandUrl: brandUrl ?? undefined },
      })
      .select("id, video_url, status")
      .single();

    if (insertError || !job) {
      return {
        status: 502,
        body: { error: "Failed to create job", details: insertError?.message },
      };
    }

    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
    const fileData = new Uint8Array(arrayBuffer);
    const transcription = await getOpenAI().audio.transcriptions.create({
      file: new File([fileData], fileName, { type: fileType }),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    let segments =
      "segments" in transcription && Array.isArray(transcription.segments)
        ? transcription.segments.map((s) => ({
            text: s.text,
            start: s.start,
            end: s.end,
          }))
        : [];

    if (trimSilence && segments.length > 0) {
      segments = trimSilenceFromSegments(segments, {
        silenceThresholdSeconds: 0.5,
        paddingSeconds: 0.05,
      });
    }

    const words =
      segments.length > 0 && trimSilence
        ? segmentsToWordSegments(segments)
        : parseWhisperSegments(segments);

    const edits = createDefaultEdits(words, brand, "9:16");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("caption_jobs")
      .update({
        segments: words,
        edits,
        aspect_ratio: edits.aspectRatio,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    await incrementUsage(userId, teamId ?? null, "videos");

    return {
      status: 200,
      body: {
        jobId: job.id,
        videoUrl: job.video_url,
        status: "pending",
        segments: words,
        wordCount: words.length,
        brand,
        edits,
        planId,
      },
    };
  } catch (e) {
    console.error("Caption pipeline error:", e);
    return {
      status: 500,
      body: {
        error: e instanceof Error ? e.message : "Caption failed",
      },
    };
  }
}
