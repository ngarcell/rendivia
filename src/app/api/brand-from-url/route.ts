import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { extractBrandFromUrl } from "@/lib/brand-from-url";
import { getSubscriptionPlanId } from "@/lib/usage";
import { canUseFeature } from "@/lib/plans";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limit = checkRateLimit(request);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planId = await getSubscriptionPlanId(userId);
    if (!canUseFeature(planId, "brandFromUrl")) {
      return NextResponse.json(
        { error: "Brand-from-URL is available on Pro and above" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json(
        { error: "Missing query parameter: url" },
        { status: 400 }
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "URL must be http or https" }, { status: 400 });
    }

    const result = await extractBrandFromUrl(url);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Brand-from-URL error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
