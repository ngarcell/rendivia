import { NextResponse } from "next/server";
import { resolveAuth } from "@/lib/api-auth";
import { getOrCreateUsage, incrementUsage } from "@/lib/usage";
import { checkLimit, getPlan, type PlanId } from "@/lib/plans";
import { runCaptionPipeline } from "@/lib/caption-pipeline";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Public API v1: caption pipeline authenticated via X-API-Key or Bearer.
 * Pro+ only. Usage counts against api_calls for rate limits.
 */
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
      { error: "API endpoint requires X-API-Key (Pro and above)" },
      { status: 403 }
    );
  }

  const usage = await getOrCreateUsage(ctx.userId, null);
  const planId = ctx.planId as PlanId;
  const withinLimit = checkLimit(
    planId,
    "apiCallsPerMonth",
    usage.apiCallsCount
  );
  if (!withinLimit) {
    const plan = getPlan(planId);
    return NextResponse.json(
      {
        error: `API limit reached (${plan.limits.apiCallsPerMonth}/month)`,
      },
      { status: 429 }
    );
  }

  const { status, body } = await runCaptionPipeline(
    request,
    ctx.userId,
    ctx.teamId
  );
  if (status === 200)
    await incrementUsage(ctx.userId, ctx.teamId, "api_calls");
  return NextResponse.json(body, { status });
}
