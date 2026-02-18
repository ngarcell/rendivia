import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { canUseFeature } from "@/lib/plans";
import { getSubscriptionPlanId } from "@/lib/usage";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ presetId: string }> }
) {
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

    const { presetId } = await params;
    const body = (await request.json()) as { name?: string; style?: unknown };

    const supabase = createServerClient();
    const updatePayload: Database["public"]["Tables"]["brand_presets"]["Update"] = {
      ...(body.name ? { name: body.name } : {}),
      ...(body.style ? { style_json: body.style } : {}),
    };

    // Supabase types can infer update() as never in some configs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("brand_presets")
      .update(updatePayload)
      .eq("id", presetId)
      .eq("user_id", userId)
      .select("id, name, style_json, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ preset: data });
  } catch (e) {
    console.error("Brand presets PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ presetId: string }> }
) {
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

    const { presetId } = await params;
    const supabase = createServerClient();
    const { error } = await supabase
      .from("brand_presets")
      .delete()
      .eq("id", presetId)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Brand presets DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
