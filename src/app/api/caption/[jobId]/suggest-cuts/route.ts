import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getSilentParts } from "@remotion/renderer";
import { canUseFeature, getPlan } from "@/lib/plans";
import { getSubscriptionPlanId } from "@/lib/usage";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planId = await getSubscriptionPlanId(userId, null);
    const plan = getPlan(planId);
    if (!canUseFeature(planId, "captionEditor")) {
      return NextResponse.json(
        { error: "Caption editor is available on Pro and above" },
        { status: 403 }
      );
    }

    const { jobId } = await params;
    const supabase = createServerClient();

    // Supabase types can infer select() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: job, error } = await (supabase as any)
      .from("caption_jobs")
      .select("id, user_id, video_url")
      .eq("id", jobId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const res = await fetch(job.video_url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to download video" }, { status: 502 });
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const tmpPath = path.join(os.tmpdir(), `rendivia-${jobId}.mp4`);
    await fs.writeFile(tmpPath, buffer);

    const silentResult = await getSilentParts({
      src: tmpPath,
      minDurationInSeconds: 0.4,
      noiseThresholdInDecibels: -35,
    });
    const silentParts = silentResult.silentParts ?? [];

    await fs.unlink(tmpPath).catch(() => {});

    // Supabase types can infer update() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("caption_jobs")
      .update({
        suggested_cuts: {
          silentParts: silentParts.map((part) => ({
            start: part.startInSeconds,
            end: part.endInSeconds,
          })),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({
      ok: true,
      suggestedCuts: {
        silentParts: silentParts.map((part) => ({
          start: part.startInSeconds,
          end: part.endInSeconds,
        })),
      },
      planId: plan.id,
    });
  } catch (e) {
    console.error("Suggest cuts error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
