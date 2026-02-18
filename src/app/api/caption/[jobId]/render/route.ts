import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSubscriptionPlanId, getOrCreateUsage, incrementUsage } from "@/lib/usage";
import { canUseFeature, getPlan } from "@/lib/plans";
import { isRemotionAllowed } from "@/lib/remotion-license";

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

    const { jobId } = await params;
    const supabase = createServerClient();

    // Supabase types can infer select() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: jobRow, error: fetchError } = await (supabase as any)
      .from("caption_jobs")
      .select("id, user_id, video_url, segments, status, render_status")
      .eq("id", jobId)
      .single();

    if (fetchError || !jobRow) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (jobRow.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (jobRow.status === "transcribing") {
      return NextResponse.json(
        { error: "Transcription not finished yet" },
        { status: 409 }
      );
    }
    if (jobRow.render_status === "queued" || jobRow.render_status === "rendering") {
      return NextResponse.json(
        { error: "Render already in progress" },
        { status: 409 }
      );
    }

    const planId = await getSubscriptionPlanId(userId, null);
    const plan = getPlan(planId);
    await getOrCreateUsage(userId, null);

    if (!canUseFeature(planId, "lambdaRender")) {
      return NextResponse.json(
        { error: "Lambda rendering is available on Pro and above" },
        { status: 403 }
      );
    }

    if (!isRemotionAllowed()) {
      return NextResponse.json(
        {
          error:
            "Rendering is disabled until a Remotion Company License is active. Set REMOTION_LICENSED=true when licensed.",
        },
        { status: 403 }
      );
    }

    const queueUrl = process.env.REMOTION_RENDER_QUEUE_URL;
    const region = process.env.REMOTION_AWS_REGION ?? "us-east-1";

    if (!queueUrl) {
      return NextResponse.json(
        { error: "Missing REMOTION_RENDER_QUEUE_URL" },
        { status: 500 }
      );
    }

    const sqs = new SQSClient({ region });

    await sqs.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({
          jobId,
          userId,
          requestedAt: new Date().toISOString(),
        }),
      })
    );

    // Supabase types can infer update() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("caption_jobs")
      .update({
        status: "rendering",
        render_status: "queued",
        render_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    await incrementUsage(userId, null, "renders");

    return NextResponse.json({
      jobId,
      status: "queued",
      message: `Render queued for ${jobId}.`,
      planId: plan.id,
    });
  } catch (e) {
    console.error("Render API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Render failed" },
      { status: 500 }
    );
  }
}
