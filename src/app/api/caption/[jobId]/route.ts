import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
    const supabase = createServerClient();

    const { data: row, error } = await supabase
      .from("caption_jobs")
      .select(
        "id, user_id, status, output_url, video_url, created_at, render_status, render_error, render_id, aspect_ratio, edits, suggested_cuts, options"
      )
      .eq("id", jobId)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = row as {
      id: string;
      user_id: string;
      status: string;
      output_url: string | null;
      video_url: string;
      created_at: string;
      render_status: string | null;
      render_error: string | null;
      render_id: string | null;
      aspect_ratio: string | null;
      edits: unknown | null;
      suggested_cuts: unknown | null;
      options: unknown | null;
    };
    if (job.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      outputUrl: job.output_url ?? undefined,
      videoUrl: job.video_url,
      createdAt: job.created_at,
      renderStatus: job.render_status ?? undefined,
      renderError: job.render_error ?? undefined,
      renderId: job.render_id ?? undefined,
      aspectRatio: job.aspect_ratio ?? undefined,
      edits: job.edits ?? undefined,
      suggestedCuts: job.suggested_cuts ?? undefined,
      options: job.options ?? undefined,
    });
  } catch (e) {
    console.error("Job GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
