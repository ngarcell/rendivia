import { createServerClient } from "@/lib/supabase/server";
import { getPlan, type PlanId } from "@/lib/plans";

export type UsageKind = "videos" | "api_calls" | "renders";

function periodStart(monthOffset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthOffset);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function periodEnd(monthOffset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthOffset + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d.toISOString().slice(0, 10);
}

export async function getOrCreateUsage(
  userId: string | null,
  teamId: string | null
): Promise<{
  videosCount: number;
  apiCallsCount: number;
  rendersCount: number;
  renderSeconds: number;
  renderPixels: number;
}> {
  const supabase = createServerClient();
  const start = periodStart();
  const end = periodEnd();

  const q = supabase
    .from("usage")
    .select("videos_count, api_calls_count, renders_count, render_seconds, render_pixels")
    .eq("period_start", start);
  if (userId) q.eq("user_id", userId);
  else q.is("user_id", null);
  if (teamId) q.eq("team_id", teamId);
  else q.is("team_id", null);
  const { data, error } = await q.maybeSingle();

  if (error) throw error;
  if (data) {
    const row = data as {
      videos_count: number;
      api_calls_count: number;
      renders_count: number;
      render_seconds: number | null;
      render_pixels: number | null;
    };
    return {
      videosCount: row.videos_count,
      apiCallsCount: row.api_calls_count,
      rendersCount: row.renders_count,
      renderSeconds: row.render_seconds ?? 0,
      renderPixels: row.render_pixels ?? 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertErr } = await (supabase as any).from("usage").insert({
    user_id: userId ?? undefined,
    team_id: teamId ?? undefined,
    period_start: start,
    period_end: end,
    videos_count: 0,
    renders_count: 0,
    api_calls_count: 0,
    render_seconds: 0,
    render_pixels: 0,
  });
  if (insertErr) throw insertErr;
  return {
    videosCount: 0,
    apiCallsCount: 0,
    rendersCount: 0,
    renderSeconds: 0,
    renderPixels: 0,
  };
}

export async function incrementUsage(
  userId: string | null,
  teamId: string | null,
  kind: UsageKind,
  amount = 1
): Promise<void> {
  const supabase = createServerClient();
  const start = periodStart();
  const usage = await getOrCreateUsage(userId, teamId);
  const newVideos = kind === "videos" ? usage.videosCount + amount : usage.videosCount;
  const newApiCalls = kind === "api_calls" ? usage.apiCallsCount + amount : usage.apiCallsCount;
  const newRenders = kind === "renders" ? usage.rendersCount + amount : usage.rendersCount;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateQ = (supabase as any)
    .from("usage")
    .update({
      videos_count: newVideos,
      renders_count: newRenders,
      api_calls_count: newApiCalls,
      render_seconds: usage.renderSeconds,
      render_pixels: usage.renderPixels,
      updated_at: new Date().toISOString(),
    })
    .eq("period_start", start);
  if (userId) updateQ = updateQ.eq("user_id", userId);
  else updateQ = updateQ.is("user_id", null);
  if (teamId) updateQ = updateQ.eq("team_id", teamId);
  else updateQ = updateQ.is("team_id", null);
  const { error } = await updateQ;

  if (error) throw error;
}

export async function incrementRenderMetrics(
  userId: string | null,
  teamId: string | null,
  seconds: number,
  pixels: number
): Promise<void> {
  const supabase = createServerClient();
  const start = periodStart();
  const usage = await getOrCreateUsage(userId, teamId);
  const nextSeconds = usage.renderSeconds + Math.max(0, seconds);
  const nextPixels = usage.renderPixels + Math.max(0, pixels);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updateQ = (supabase as any)
    .from("usage")
    .update({
      render_seconds: nextSeconds,
      render_pixels: nextPixels,
      updated_at: new Date().toISOString(),
    })
    .eq("period_start", start);
  if (userId) updateQ = updateQ.eq("user_id", userId);
  else updateQ = updateQ.is("user_id", null);
  if (teamId) updateQ = updateQ.eq("team_id", teamId);
  else updateQ = updateQ.is("team_id", null);
  const { error } = await updateQ;
  if (error) throw error;
}

export async function checkLimit(
  planId: PlanId,
  kind: UsageKind,
  current: number
): Promise<boolean> {
  const plan = getPlan(planId);
  const limit =
    kind === "videos" || kind === "renders"
      ? plan.limits.videosPerMonth
      : plan.limits.apiCallsPerMonth;
  if (limit === -1) return true;
  return current < limit;
}

export async function getSubscriptionPlanId(
  userId: string,
  teamId?: string | null
): Promise<PlanId> {
  const supabase = createServerClient();
  if (teamId) {
    const { data } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("team_id", teamId)
      .eq("status", "active")
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle();
    const row = data as { plan_id?: string } | null;
    if (row?.plan_id) return row.plan_id as PlanId;
  }
  const { data } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  const userRow = data as { plan_id?: string } | null;
  return (userRow?.plan_id as PlanId) ?? "starter";
}
