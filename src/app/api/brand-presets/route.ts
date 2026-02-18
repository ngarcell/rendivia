import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { canUseFeature } from "@/lib/plans";
import { getSubscriptionPlanId } from "@/lib/usage";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const planId = await getSubscriptionPlanId(userId, null);
    if (!canUseFeature(planId, "captionEditor")) {
      return NextResponse.json(
        { error: "Caption editor is available on Pro and above" },
        { status: 403 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("brand_presets")
      .select("id, name, style_json, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ presets: data ?? [] });
  } catch (e) {
    console.error("Brand presets GET error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const planId = await getSubscriptionPlanId(userId, null);
    if (!canUseFeature(planId, "captionEditor")) {
      return NextResponse.json(
        { error: "Caption editor is available on Pro and above" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { name?: string; style?: unknown };
    if (!body?.name || !body?.style) {
      return NextResponse.json({ error: "Missing name or style" }, { status: 400 });
    }

    const supabase = createServerClient();
    // Supabase types can infer insert() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("brand_presets")
      .insert({
        user_id: userId,
        name: body.name,
        style_json: body.style,
      })
      .select("id, name, style_json, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ preset: data });
  } catch (e) {
    console.error("Brand presets POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
