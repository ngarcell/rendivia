import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { runCaptionPipeline } from "@/lib/caption-pipeline";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const limit = checkRateLimit(request);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { status, body } = await runCaptionPipeline(request, userId);
  return NextResponse.json(body, { status });
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const renderStatus = searchParams.get("renderStatus");
    const outputOnly = searchParams.get("output") === "1";
    const limitParam = Number(searchParams.get("limit") ?? 50);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

    const supabase = createServerClient();
    let query = supabase
      .from("caption_jobs")
      .select(
        "id, user_id, status, output_url, video_url, created_at, render_status, render_error, render_id, aspect_ratio, edits, suggested_cuts"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);
    if (renderStatus) query = query.eq("render_status", renderStatus);
    if (outputOnly) query = query.not("output_url", "is", null);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: data ?? [] });
  } catch (e) {
    console.error("Jobs GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
