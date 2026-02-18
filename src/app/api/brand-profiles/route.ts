import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("brand_profiles")
      .select("id, name, logo_url, colors, font_family, intro_text, outro_text, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: data ?? [] });
  } catch (e) {
    console.error("Brand profiles GET error:", e);
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

    const body = (await request.json()) as {
      name?: string;
      logoUrl?: string | null;
      colors?: Record<string, string>;
      fontFamily?: string | null;
      introText?: string | null;
      outroText?: string | null;
    };

    if (!body?.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("brand_profiles")
      .insert({
        user_id: userId,
        name: body.name.trim(),
        logo_url: body.logoUrl ?? null,
        colors: body.colors ?? {},
        font_family: body.fontFamily ?? null,
        intro_text: body.introText ?? null,
        outro_text: body.outroText ?? null,
      })
      .select("id, name, logo_url, colors, font_family, intro_text, outro_text, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (e) {
    console.error("Brand profiles POST error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
