import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateUsage, getSubscriptionPlanId } from "@/lib/usage";
import { getPlan } from "@/lib/plans";
import { isRemotionAllowed, isRemotionLicensed } from "@/lib/remotion-license";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planId = await getSubscriptionPlanId(userId);
    const plan = getPlan(planId);
    const usage = await getOrCreateUsage(userId, null);

    return NextResponse.json({
      planId,
      planName: plan.name,
      limits: plan.limits,
      features: plan.features,
      remotionLicensed: isRemotionLicensed(),
      renderingEnabled: isRemotionAllowed(),
      usage: {
        videosCount: usage.videosCount,
        rendersCount: usage.rendersCount,
        apiCallsCount: usage.apiCallsCount,
        renderSeconds: usage.renderSeconds,
        renderPixels: usage.renderPixels,
      },
    });
  } catch (e) {
    console.error("Usage API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
