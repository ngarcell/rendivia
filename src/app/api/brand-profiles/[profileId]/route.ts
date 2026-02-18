import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await params;
    const body = (await request.json()) as {
      name?: string;
      logoUrl?: string | null;
      colors?: Record<string, string>;
      fontFamily?: string | null;
      introText?: string | null;
      outroText?: string | null;
    };

    const updatePayload = {
      ...(body.name ? { name: body.name.trim() } : {}),
      ...(body.logoUrl !== undefined ? { logo_url: body.logoUrl } : {}),
      ...(body.colors !== undefined ? { colors: body.colors } : {}),
      ...(body.fontFamily !== undefined ? { font_family: body.fontFamily } : {}),
      ...(body.introText !== undefined ? { intro_text: body.introText } : {}),
      ...(body.outroText !== undefined ? { outro_text: body.outroText } : {}),
    };

    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from("brand_profiles")
      .select("id, user_id")
      .eq("id", profileId)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    if (row.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("brand_profiles")
      .update(updatePayload)
      .eq("id", profileId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Brand profiles PATCH error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId } = await params;
    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from("brand_profiles")
      .select("id, user_id")
      .eq("id", profileId)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    if (row.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from("brand_profiles")
      .delete()
      .eq("id", profileId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Brand profiles DELETE error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
