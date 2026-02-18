import { NextResponse } from "next/server";
import { resolveAuth } from "@/lib/api-auth";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const ctx = await resolveAuth(_request);
  if (!ctx) {
    return NextResponse.json(
      { error: "Unauthorized. Provide X-API-Key or sign in." },
      { status: 401 }
    );
  }
  if (!ctx.isApiKey) {
    return NextResponse.json(
      { error: "API endpoint requires X-API-Key" },
      { status: 403 }
    );
  }

  const { jobId } = await params;
  const supabase = createServerClient();

  let query = supabase
    .from("render_jobs")
    .select(
      "id, template_id, template_version, status, output_url, render_error, created_at, updated_at"
    )
    .eq("id", jobId);

  if (ctx.teamId) {
    query = query.eq("team_id", ctx.teamId);
  } else {
    query = query.eq("user_id", ctx.userId);
  }

  type RenderJobRow = {
    id: string;
    template_id: string;
    template_version: string;
    status: string;
    output_url: string | null;
    render_error: string | null;
    created_at: string;
    updated_at: string;
  };

  const { data, error } = await query.single();
  const row = data as RenderJobRow | null;
  if (error || !row) {
    return NextResponse.json({ error: "Render job not found" }, { status: 404 });
  }

  return NextResponse.json({
    jobId: row.id,
    template: row.template_id,
    version: row.template_version,
    status: row.status,
    outputUrl: row.output_url ?? null,
    error: row.render_error ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
