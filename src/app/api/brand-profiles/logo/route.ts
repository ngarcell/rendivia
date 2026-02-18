import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing logo file" }, { status: 400 });
    }

    const safeName = file.name.replace(/\s+/g, "-");
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "image/png";

    const supabase = createServerClient();
    const bucket = "uploads";
    const path = `${userId}/brand-logos/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, path });
  } catch (e) {
    console.error("Brand logo upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
