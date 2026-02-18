/**
 * Rendivia plans: Starter → Pro → Team → Enterprise.
 * Pricing aligned with market (Submagic, Kapwing, Descript, Opus Clip): free tier for lead gen,
 * Pro under $30 to undercut Submagic Growth ($40–59), Team at mid-market ($59) for agencies.
 */
export type PlanId = "starter" | "pro" | "team" | "enterprise";

export interface PlanLimits {
  videosPerMonth: number;
  apiCallsPerMonth: number;
  maxVideoDurationMinutes: number;
  teamSeats: number; // 0 = solo, 1+ = team
  storageGb: number;
}

export interface PlanFeatures {
  captions: boolean;
  trimSilence: boolean;
  audioEnhancement: boolean;
  brandFromUrl: boolean;
  dataToVideo: boolean;
  apiAccess: boolean;
  batchExport: boolean;
  captionEditor: boolean;
  lambdaRender: boolean;
  sso: boolean;
  dedicatedSupport: boolean;
  sla: boolean;
  customBranding: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  limits: PlanLimits;
  features: PlanFeatures;
  priceMonthlyCents: number | null; // null = contact
  priceYearlyCents: number | null;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Try programmatic captions—no card required",
    limits: {
      videosPerMonth: 15,
      apiCallsPerMonth: 0,
      maxVideoDurationMinutes: 5,
      teamSeats: 1,
      storageGb: 1,
    },
    features: {
      captions: true,
      trimSilence: false,
      audioEnhancement: false,
      brandFromUrl: false,
      dataToVideo: false,
      apiAccess: false,
      batchExport: false,
      captionEditor: false,
      lambdaRender: false,
      sso: false,
      dedicatedSupport: false,
      sla: false,
      customBranding: false,
    },
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Serious creators & freelancers—trim, brand, API",
    limits: {
      videosPerMonth: 150,
      apiCallsPerMonth: 1000,
      maxVideoDurationMinutes: 20,
      teamSeats: 1,
      storageGb: 15,
    },
    features: {
      captions: true,
      trimSilence: true,
      audioEnhancement: true,
      brandFromUrl: true,
      dataToVideo: true,
      apiAccess: true,
      batchExport: true,
      captionEditor: true,
      lambdaRender: true,
      sso: false,
      dedicatedSupport: false,
      sla: false,
      customBranding: false,
    },
    priceMonthlyCents: 2400, // $24/mo — under Submagic Growth ($40–59), Opus Pro ($29)
    priceYearlyCents: 22800, // $228/yr = 2 months free (~17% off)
  },
  team: {
    id: "team",
    name: "Team",
    description: "Agencies & teams—SSO, 5 seats, high volume",
    limits: {
      videosPerMonth: 500,
      apiCallsPerMonth: 5000,
      maxVideoDurationMinutes: 30,
      teamSeats: 5,
      storageGb: 50,
    },
    features: {
      captions: true,
      trimSilence: true,
      audioEnhancement: true,
      brandFromUrl: true,
      dataToVideo: true,
      apiAccess: true,
      batchExport: true,
      captionEditor: true,
      lambdaRender: true,
      sso: true,
      dedicatedSupport: false,
      sla: false,
      customBranding: false,
    },
    priceMonthlyCents: 5900, // $59/mo — in line with Descript/Kapwing Business ($50–65)
    priceYearlyCents: 59000, // $590/yr = 2 months free
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited scale, SLA, dedicated support, custom branding",
    limits: {
      videosPerMonth: -1,
      apiCallsPerMonth: -1,
      maxVideoDurationMinutes: 120,
      teamSeats: -1,
      storageGb: -1,
    },
    features: {
      captions: true,
      trimSilence: true,
      audioEnhancement: true,
      brandFromUrl: true,
      dataToVideo: true,
      apiAccess: true,
      batchExport: true,
      captionEditor: true,
      lambdaRender: true,
      sso: true,
      dedicatedSupport: true,
      sla: true,
      customBranding: true,
    },
    priceMonthlyCents: null,
    priceYearlyCents: null,
  },
};

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

export function canUseFeature(planId: PlanId, feature: keyof PlanFeatures): boolean {
  return PLANS[planId]?.features[feature] ?? false;
}

export function checkLimit(
  planId: PlanId,
  limitKey: keyof PlanLimits,
  current: number
): boolean {
  const limit = PLANS[planId]?.limits[limitKey];
  if (limit === undefined) return false;
  if (limit === -1) return true; // unlimited
  return current < limit;
}
