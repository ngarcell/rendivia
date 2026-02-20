import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type EarlyAccessPayload = {
  name: string | null;
  email: string;
  company: string | null;
  role: string | null;
  company_size: string | null;
  use_case: string | null;
  data_source: string | null;
  timeline: string | null;
  monthly_renders: number | null;
  cohort: string;
  source: string | null;
  landing_path: string | null;
  cluster: string | null;
  intent_slug: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  referrer: string | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : null;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const payload: EarlyAccessPayload = {
      name,
      email,
      company: typeof body.company === "string" ? body.company.trim() : null,
      role: typeof body.role === "string" ? body.role.trim() : null,
      company_size: typeof body.companySize === "string" ? body.companySize.trim() : null,
      use_case: typeof body.useCase === "string" ? body.useCase.trim() : null,
      data_source: typeof body.dataSource === "string" ? body.dataSource.trim() : null,
      timeline: typeof body.timeline === "string" ? body.timeline.trim() : null,
      monthly_renders: Number.isFinite(body.monthlyRenders) ? body.monthlyRenders : null,
      cohort: typeof body.cohort === "string" ? body.cohort.trim() : "general",
      source: typeof body.source === "string" ? body.source.trim() : null,
      landing_path: typeof body.landingPath === "string" ? body.landingPath.trim() : null,
      cluster: typeof body.cluster === "string" ? body.cluster.trim() : null,
      intent_slug: typeof body.intentSlug === "string" ? body.intentSlug.trim() : null,
      utm_source: typeof body.utm_source === "string" ? body.utm_source.trim() : null,
      utm_medium: typeof body.utm_medium === "string" ? body.utm_medium.trim() : null,
      utm_campaign: typeof body.utm_campaign === "string" ? body.utm_campaign.trim() : null,
      utm_term: typeof body.utm_term === "string" ? body.utm_term.trim() : null,
      utm_content: typeof body.utm_content === "string" ? body.utm_content.trim() : null,
      gclid: typeof body.gclid === "string" ? body.gclid.trim() : null,
      referrer: typeof body.referrer === "string" ? body.referrer.trim() : null,
    };

    const { error } = await supabase.from("early_access_requests").insert(payload as never);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
