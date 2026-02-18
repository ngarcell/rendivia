import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type DailyBucket = {
  date: string;
  total: number;
  completed: number;
  failed: number;
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = Number(searchParams.get("days") ?? 7);
    const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 31) : 7;

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const buckets: DailyBucket[] = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      buckets.push({ date: formatDate(d), total: 0, completed: 0, failed: 0 });
    }
    const indexByDate = new Map(buckets.map((bucket, index) => [bucket.date, index]));

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("render_jobs")
      .select("status, created_at, updated_at")
      .eq("user_id", userId)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: true })
      .limit(5000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type RenderJobRow = {
      status: string | null;
      created_at: string | null;
      updated_at: string | null;
    };

    const rows = (data as RenderJobRow[]) ?? [];

    let total = 0;
    let completed = 0;
    let failed = 0;
    let totalDurationMs = 0;

    for (const job of rows) {
      if (!job?.created_at) continue;
      const dateKey = String(job.created_at).slice(0, 10);
      const bucketIndex = indexByDate.get(dateKey);
      if (bucketIndex !== undefined) {
        buckets[bucketIndex].total += 1;
        if (job.status === "completed") buckets[bucketIndex].completed += 1;
        if (job.status === "failed") buckets[bucketIndex].failed += 1;
      }

      total += 1;
      if (job.status === "completed") completed += 1;
      if (job.status === "failed") failed += 1;

      if (job.status === "completed" && job.created_at && job.updated_at) {
        const created = new Date(job.created_at).getTime();
        const updated = new Date(job.updated_at).getTime();
        if (Number.isFinite(created) && Number.isFinite(updated)) {
          totalDurationMs += Math.max(0, updated - created);
        }
      }
    }

    const avgRenderSeconds =
      completed > 0 ? Math.round(totalDurationMs / completed / 1000) : null;

    return NextResponse.json({
      days,
      daily: buckets,
      totals: {
        total,
        completed,
        failed,
        avgRenderSeconds,
      },
    });
  } catch (e) {
    console.error("Render jobs summary error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
