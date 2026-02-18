import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const runtime = "nodejs";

function timingSafeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function buildSignature(payload: string, secret: string) {
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(payload, "utf8");
  return `sha512=${hmac.digest("hex")}`;
}

export async function POST(request: Request) {
  try {
    const secret = process.env.REMOTION_WEBHOOK_SECRET;
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-remotion-signature");

    if (secret && signatureHeader) {
      const expected = buildSignature(rawBody, secret);
      if (!timingSafeEqual(expected, signatureHeader)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody) as {
      type?: string;
      status?: string;
      renderId?: string;
      bucketName?: string;
      outputFile?: string;
      errors?: Array<{ message?: string }>;
      customData?: { jobId?: string };
    };

    const jobId = payload.customData?.jobId;
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const status = payload.type ?? payload.status ?? "";
    const supabase = createServerClient();

    if (status === "success" || status === "completed") {
      // Supabase types can infer update() as never in some configs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("caption_jobs")
        .update({
          render_status: "completed",
          render_id: payload.renderId ?? null,
          output_url: payload.outputFile ?? null,
          status: "completed",
          rendered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    } else if (status === "timeout" || status === "error" || status === "failed") {
      // Supabase types can infer update() as never in some configs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("caption_jobs")
        .update({
          render_status: "failed",
          render_id: payload.renderId ?? null,
          render_error: payload.errors?.[0]?.message ?? "Render failed",
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Remotion webhook error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
