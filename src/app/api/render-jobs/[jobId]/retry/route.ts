import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { createServerClient } from "@/lib/supabase/server";

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

    const { jobId } = await params;
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: job, error } = await (supabase as any)
      .from("render_jobs")
      .select("id, user_id")
      .eq("id", jobId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Render job not found" }, { status: 404 });
    }

    if (job.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const queueUrl = process.env.REMOTION_RENDER_QUEUE_URL;
    const region = process.env.REMOTION_AWS_REGION ?? "us-east-1";
    if (!queueUrl) {
      return NextResponse.json({ error: "Missing REMOTION_RENDER_QUEUE_URL" }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("render_jobs")
      .update({
        status: "queued",
        output_url: null,
        render_error: null,
        webhook_status: null,
        webhook_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const sqs = new SQSClient({ region });
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({
          jobType: "template",
          renderJobId: jobId,
          requestedAt: new Date().toISOString(),
          retry: true,
        }),
      })
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Render job retry error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
