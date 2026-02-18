"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type FormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  companySize: string;
  useCase: string;
  dataSource: string;
  timeline: string;
  monthlyRenders: string;
};

interface EarlyAccessFormProps {
  cohort?: string;
  source?: string;
}

const DEFAULT_STATE: FormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  companySize: "",
  useCase: "",
  dataSource: "",
  timeline: "",
  monthlyRenders: "",
};

export default function EarlyAccessForm({ cohort = "design-partner", source }: EarlyAccessFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const effectiveSource = useMemo(() => {
    if (source) return source;
    if (typeof window === "undefined") return "unknown";
    return window.location.pathname;
  }, [source]);

  const handleChange = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const payload = {
        ...form,
        monthlyRenders: form.monthlyRenders ? Number(form.monthlyRenders) : null,
        cohort,
        source: effectiveSource,
      };

      trackEvent("early_access_submit", { cohort, source: effectiveSource });

      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Submission failed");
      }

      setStatus("success");
      setMessage("Thanks — we will reach out within 48 hours.");
      setForm(DEFAULT_STATE);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Submission failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card p-6"
    >
      <h3 className="text-lg font-semibold text-zinc-900">Join the cohort</h3>
      <p className="mt-2 text-xs text-zinc-500">
        Tell us about your workflow. We use this to qualify design partners.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Name
          <input
            required
            value={form.name}
            onChange={handleChange("name")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
            placeholder="Ava Patel"
          />
        </label>
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Work email
          <input
            required
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
            placeholder="ava@company.com"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Company
          <input
            value={form.company}
            onChange={handleChange("company")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
            placeholder="Acme Analytics"
          />
        </label>
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Role
          <select
            value={form.role}
            onChange={handleChange("role")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
          >
            <option value="">Select role</option>
            <option value="Founder">Founder</option>
            <option value="Engineer">Engineer</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Marketing">Marketing</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Company size
          <select
            value={form.companySize}
            onChange={handleChange("companySize")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
          >
            <option value="">Select size</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-1000">201-1000</option>
            <option value="1000+">1000+</option>
          </select>
        </label>
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Monthly renders (estimate)
          <input
            type="number"
            min="0"
            value={form.monthlyRenders}
            onChange={handleChange("monthlyRenders")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
            placeholder="1200"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Primary use case
          <textarea
            value={form.useCase}
            onChange={handleChange("useCase")}
            className="min-h-[84px] rounded-[var(--radius-card)] border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm"
            placeholder="Weekly metrics video for customer workspaces"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Data source
          <input
            value={form.dataSource}
            onChange={handleChange("dataSource")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
            placeholder="Postgres, Stripe, Segment"
          />
        </label>
        <label className="grid gap-2 text-xs font-semibold text-zinc-600">
          Timeline
          <select
            value={form.timeline}
            onChange={handleChange("timeline")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-sm"
          >
            <option value="">Select timeline</option>
            <option value="Immediately">Immediately</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="Later">Later</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {status === "submitting" ? "Submitting…" : "Request early access"}
        </button>
        <span className="text-xs text-zinc-500">Cohort: {cohort}</span>
      </div>

      {message && (
        <p className={`mt-3 text-xs font-semibold ${status === "success" ? "text-emerald-600" : "text-rose-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
