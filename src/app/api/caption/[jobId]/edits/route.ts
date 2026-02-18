import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createDefaultEdits, normalizeEdits, type CaptionEdits } from "@/lib/caption-edits";
import { DEFAULT_BRAND_PRESET } from "@/lib/brand-preset";
import type { WordSegment } from "@/remotion/WordSegment";
import { canUseFeature } from "@/lib/plans";
import { getSubscriptionPlanId } from "@/lib/usage";
import type { Database } from "@/types/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const planId = await getSubscriptionPlanId(userId, null);
    if (!canUseFeature(planId, "captionEditor")) {
      return NextResponse.json(
        { error: "Caption editor is available on Pro and above" },
        { status: 403 }
      );
    }
    const supabase = createServerClient();

    // Supabase types can infer select() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from("caption_jobs")
      .select("id, user_id, edits, segments, aspect_ratio")
      .eq("id", jobId)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = row as {
      id: string;
      user_id: string;
      edits: unknown | null;
      segments: unknown | null;
      aspect_ratio: string | null;
    };

    if (job.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const segments = Array.isArray(job.segments) ? (job.segments as WordSegment[]) : [];
    const fallback = createDefaultEdits(segments, DEFAULT_BRAND_PRESET, "9:16");
    const edits = normalizeEdits(job.edits as Partial<CaptionEdits> | null, fallback);

    if (!job.edits) {
      const updatePayload: Database["public"]["Tables"]["caption_jobs"]["Update"] = {
        edits,
        aspect_ratio: edits.aspectRatio,
        updated_at: new Date().toISOString(),
      };
      // Supabase types can infer update() as never in some configs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("caption_jobs").update(updatePayload).eq("id", jobId);
    }

    return NextResponse.json({ edits });
  } catch (e) {
    console.error("Edits GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const planId = await getSubscriptionPlanId(userId, null);
    if (!canUseFeature(planId, "captionEditor")) {
      return NextResponse.json(
        { error: "Caption editor is available on Pro and above" },
        { status: 403 }
      );
    }
    const body = (await request.json()) as { edits?: unknown };
    if (!body?.edits || typeof body.edits !== "object") {
      return NextResponse.json({ error: "Missing edits" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Supabase types can infer select() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from("caption_jobs")
      .select("id, user_id")
      .eq("id", jobId)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (row.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsedEdits = body.edits as Partial<CaptionEdits>;
    const updatePayload: Database["public"]["Tables"]["caption_jobs"]["Update"] = {
      edits: body.edits,
      aspect_ratio: parsedEdits.aspectRatio ?? null,
      updated_at: new Date().toISOString(),
    };
    // Supabase types can infer update() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("caption_jobs").update(updatePayload).eq("id", jobId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Edits PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
