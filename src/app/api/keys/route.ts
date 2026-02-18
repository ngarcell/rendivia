import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createApiKeyForUser } from "@/lib/api-key";
import { getSubscriptionPlanId } from "@/lib/usage";
import { canUseFeature } from "@/lib/plans";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, last_used_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ keys: data ?? [] });
  } catch (e) {
    console.error("API keys GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    if (!canUseFeature(planId, "apiAccess")) {
      return NextResponse.json(
        { error: "API access is available on Pro and above" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const name = (body.name as string) || "Default";

    const { key, id } = await createApiKeyForUser(userId, name);
    return NextResponse.json({
      id,
      key,
      name,
      message: "Save this key; it will not be shown again.",
    });
  } catch (e) {
    console.error("API key create error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
