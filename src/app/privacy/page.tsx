import Link from "next/link";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy Policy – Rendivia",
  description: "Rendivia privacy policy and data practices.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Privacy", href: "/privacy" },
        ]}
      />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <Link
          href="/"
          className="touch-target inline-flex min-h-[44px] items-center text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Home
        </Link>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
          Privacy Policy
        </h1>
        <p className="mt-4 text-zinc-600">
          Last updated: February 4, 2026.
        </p>
        <div className="mt-10 space-y-6 text-zinc-600">
          <p>
            Rendivia helps teams turn long-form video into short clips with
            captions. This policy explains what we collect, how we use it, and
            the choices you have.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Data we collect.</span>{" "}
            We collect account details (name, email), usage data (projects,
            renders, API calls), and the content you provide (video uploads,
            transcripts, captions, brand presets). If you subscribe to a paid
            plan, billing is handled by a payment provider and we receive the
            plan and status.
          </p>
          <p>
            <span className="font-medium text-zinc-900">How we use data.</span>{" "}
            We use data to deliver the service (upload, transcribe, edit, and
            render), maintain security, provide support, and improve Rendivia. We
            may aggregate usage metrics to understand performance and product
            demand.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Service providers.</span>{" "}
            Rendivia relies on cloud infrastructure and third-party vendors for
            authentication, storage, and processing. These providers are bound
            by confidentiality and only process data to deliver the service.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Retention.</span> We
            keep your data while your account is active. You can request export
            or deletion by contacting us. We may retain minimal records for
            compliance or security.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Your choices.</span>{" "}
            You can update account details, delete projects, or request account
            deletion. Contact us for help with data requests.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Cookies.</span> We use
            essential cookies to run the app and may use analytics cookies to
            understand usage.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Contact.</span> Email{" "}
            <a
              href="mailto:founders@rendivia.ai"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              founders@rendivia.ai
            </a>{" "}
            with privacy questions.
          </p>
        </div>
        <p className="mt-10">
          <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
            Back to home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
