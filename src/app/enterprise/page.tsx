import { SiteFooter } from "@/components/SiteFooter";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Enterprise", href: "/enterprise" },
        ]}
      />
      <section className="px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl title-animate">
            Enterprise API for programmatic video
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Dedicated rendering capacity, custom templates, and SLAs for teams shipping video at scale.
          </p>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-[var(--muted-bg)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
            What is included
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {
              [
                "Dedicated rendering capacity (Lambda or containers)",
                "Custom template development and versioning",
                "SLA-backed delivery and uptime",
                "Security review and compliance support",
                "SSO and team management",
                "Priority support and onboarding",
              ].map((item) => (
                <li key={item} className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                  {item}
                </li>
              ))
            }
          </ul>
        </div>
      </section>

      <section className="border-t border-zinc-200 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">Contact sales</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Tell us about volume, templates, and delivery requirements. We will reply with pricing and next steps.
          </p>
          <a
            href="mailto:enterprise@rendivia.com?subject=Enterprise%20API%20inquiry"
            className="touch-target mt-6 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            enterprise@rendivia.com
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
