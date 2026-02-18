import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const body = (await request.json()) as {
      email?: string;
      enabled?: boolean;
    };

    const email = body.email?.trim() ?? "";
    const enabled = Boolean(body.enabled);

    if (enabled && !email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Supabase types can infer select() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: job, error } = await (supabase as any)
      .from("caption_jobs")
      .select("id, user_id, options")
      .eq("id", jobId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentOptions = (job.options ?? {}) as Record<string, unknown>;
    const nextOptions = {
      ...currentOptions,
      notifyEmail: enabled ? email : null,
      notifyOnComplete: enabled,
    };

    // Supabase types can infer update() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("caption_jobs")
      .update({ options: nextOptions, updated_at: new Date().toISOString() })
      .eq("id", jobId);

    return NextResponse.json({ ok: true, options: nextOptions });
  } catch (e) {
    console.error("Notify API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
