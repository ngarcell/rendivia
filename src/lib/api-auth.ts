import { auth } from "@clerk/nextjs/server";
import { validateApiKey } from "@/lib/api-key";
import { getSubscriptionPlanId } from "@/lib/usage";
import { canUseFeature } from "@/lib/plans";

export type AuthContext = {
  userId: string;
  teamId: string | null;
  planId: string;
  isApiKey: boolean;
};

export async function resolveAuth(request: Request): Promise<AuthContext | null> {
  const apiKey = request.headers.get("x-api-key") ?? request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (apiKey) {
    const resolved = await validateApiKey(apiKey);
    if (!resolved) return null;
    const userId = resolved.userId ?? (resolved.teamId as string);
    if (!userId) return null;
    const planId = await getSubscriptionPlanId(userId, resolved.teamId);
    if (!canUseFeature(planId, "apiAccess")) return null;
    return {
      userId,
      teamId: resolved.teamId ?? null,
      planId,
      isApiKey: true,
    };
  }
  const { userId } = await auth();
  if (!userId) return null;
  const planId = await getSubscriptionPlanId(userId, null);
  return { userId, teamId: null, planId, isApiKey: false };
}
