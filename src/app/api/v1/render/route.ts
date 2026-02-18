import { NextResponse } from "next/server";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { resolveAuth } from "@/lib/api-auth";
import { getOrCreateUsage, incrementUsage } from "@/lib/usage";
import { getPlan, type PlanId, checkLimit } from "@/lib/plans";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";
import { brandProfileToRenderBrand } from "@/lib/brand-profile";
import { getTemplateDefinition, validateTemplateInput } from "@/lib/video-templates";
import { isRemotionAllowed } from "@/lib/remotion-license";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = checkRateLimit(request);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const ctx = await resolveAuth(request);
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

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const templateId = (body as { template?: string }).template;
  const data = (body as { data?: unknown }).data;
  const brandRef = (body as { brand?: string }).brand;
  const webhook = (body as { webhook?: { url?: string; secret?: string } }).webhook;
  const webhookUrl = webhook?.url && typeof webhook.url === "string" ? webhook.url : null;
  const webhookSecret =
    webhook?.secret && typeof webhook.secret === "string" ? webhook.secret : null;

  if (!templateId || typeof templateId !== "string") {
    return NextResponse.json({ error: "Missing template" }, { status: 400 });
  }

  const template = getTemplateDefinition(templateId);
  if (!template) {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  }

  const parsed = validateTemplateInput(template, data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid template data", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const usage = await getOrCreateUsage(ctx.userId, ctx.teamId);
  const planId = ctx.planId as PlanId;
  const withinLimit = checkLimit(planId, "apiCallsPerMonth", usage.apiCallsCount);
  if (!withinLimit) {
    const plan = getPlan(planId);
    return NextResponse.json(
      { error: `API limit reached (${plan.limits.apiCallsPerMonth}/month)` },
      { status: 429 }
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

  const supabase = createServerClient();
  let brandRow: Record<string, unknown> | null = null;

  if (brandRef && typeof brandRef === "string") {
    let brandQuery = supabase
      .from("brand_profiles")
      .select("id, name, logo_url, colors, font_family, intro_text, outro_text")
      .limit(1);
    if (ctx.teamId) {
      brandQuery = brandQuery.eq("team_id", ctx.teamId);
    } else {
      brandQuery = brandQuery.eq("user_id", ctx.userId);
    }
    if (UUID_RE.test(brandRef)) {
      brandQuery = brandQuery.eq("id", brandRef);
    } else {
      brandQuery = brandQuery.eq("name", brandRef);
    }
    const { data: brandData } = await brandQuery.maybeSingle();
    brandRow = (brandData as Record<string, unknown> | null) ?? null;
  }

  const brand = brandProfileToRenderBrand(brandRow);
  const inputProps = template.buildProps(parsed.data, brand);
  const durationSeconds =
    typeof (inputProps as { durationSeconds?: number }).durationSeconds === "number"
      ? (inputProps as { durationSeconds?: number }).durationSeconds!
      : template.defaultDurationSeconds;
  const resolution = `${template.resolution.width}x${template.resolution.height}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: job, error: insertError } = await (supabase as any)
    .from("render_jobs")
    .insert({
      user_id: ctx.userId,
      team_id: ctx.teamId ?? null,
      template_id: template.id,
      template_version: template.version,
      input_data: parsed.data,
      input_props: inputProps,
      brand_id: (brandRow?.id as string | undefined) ?? null,
      status: "queued",
      webhook_url: webhookUrl,
      webhook_secret: webhookSecret,
      duration_seconds: durationSeconds,
      resolution,
    })
    .select("id, template_id, template_version, status")
    .single();

  if (insertError || !job) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create render job" },
      { status: 500 }
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
        jobType: "template",
        renderJobId: job.id,
        requestedAt: new Date().toISOString(),
      }),
    })
  );

  await incrementUsage(ctx.userId, ctx.teamId, "api_calls");
  await incrementUsage(ctx.userId, ctx.teamId, "renders");

  return NextResponse.json({ jobId: job.id, status: "queued" });
}
