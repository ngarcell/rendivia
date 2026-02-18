"use client";

import { useMemo, useState } from "react";

const PLANS = {
  starter: { label: "Starter", price: 99, included: 500 },
  growth: { label: "Growth", price: 299, included: 2500 },
  scale: { label: "Scale", price: 999, included: 10000 },
} as const;

type PlanKey = keyof typeof PLANS;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function PricingRoiCalculator() {
  const [plan, setPlan] = useState<PlanKey>("growth");
  const [renders, setRenders] = useState(1500);
  const [manualCost, setManualCost] = useState(25);

  const planMeta = PLANS[plan];

  const metrics = useMemo(() => {
    const monthlyRenders = Math.max(0, renders);
    const overageRenders = Math.max(0, monthlyRenders - planMeta.included);
    const overageCost = overageRenders * 0.02;
    const rendiviaCost = planMeta.price + overageCost;
    const manualTotal = monthlyRenders * manualCost;
    const savings = manualTotal - rendiviaCost;
    const roi = manualTotal ? Math.round((savings / manualTotal) * 100) : 0;
    const costPerRender = monthlyRenders ? rendiviaCost / monthlyRenders : 0;
    return {
      overageRenders,
      overageCost,
      rendiviaCost,
      manualTotal,
      savings,
      roi,
      costPerRender,
    };
  }, [planMeta, renders, manualCost]);

  return (
    <div className="surface-card p-6">
      <h3 className="text-lg font-semibold text-zinc-900">Pricing ROI calculator</h3>
      <p className="mt-2 text-sm text-zinc-500">
        Compare manual video costs to Rendivia usage. Adjust the inputs to see estimated savings.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Plan
          <select
            value={plan}
            onChange={(event) => setPlan(event.target.value as PlanKey)}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
          >
            {Object.entries(PLANS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Renders / month
          <input
            type="number"
            min="0"
            value={renders}
            onChange={(event) => setRenders(Number(event.target.value))}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
          />
        </label>
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Manual cost / video
          <input
            type="number"
            min="0"
            value={manualCost}
            onChange={(event) => setManualCost(Number(event.target.value))}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-zinc-200 bg-[var(--surface-muted)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Rendivia cost</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{currency.format(metrics.rendiviaCost)}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Includes {planMeta.included} renders, {metrics.overageRenders} overage renders.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Effective cost per render: {currency.format(metrics.costPerRender)}
          </p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-zinc-200 bg-[var(--surface-muted)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Manual cost</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{currency.format(metrics.manualTotal)}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Estimated savings: {currency.format(metrics.savings)} ({metrics.roi}%)
          </p>
          <p className="mt-1 text-xs text-zinc-500">ROI assumes one render per video.</p>
        </div>
      </div>
    </div>
  );
}
