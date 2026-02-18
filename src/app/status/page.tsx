import { SiteFooter } from "@/components/SiteFooter";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Status", href: "/status" },
        ]}
      />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
          Status
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          All systems operational.
        </p>
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Render API</p>
              <p className="mt-1 text-xs text-zinc-500">Queue + workers</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Operational
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Webhooks</p>
              <p className="mt-1 text-xs text-zinc-500">Delivery + retries</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Operational
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Dashboard</p>
              <p className="mt-1 text-xs text-zinc-500">API keys + usage</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Operational
            </span>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
