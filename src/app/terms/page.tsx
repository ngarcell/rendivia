import Link from "next/link";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Terms of Service – Rendivia",
  description: "Rendivia terms of service and acceptable use.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Terms", href: "/terms" },
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
          Terms of Service
        </h1>
        <p className="mt-4 text-zinc-600">
          Last updated: February 4, 2026.
        </p>
        <div className="mt-10 space-y-6 text-zinc-600">
          <p>
            These Terms govern your use of Rendivia, a software platform that
            turns long-form video into short clips with captions. By using
            Rendivia, you agree to these Terms.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Accounts.</span> You are
            responsible for your account, credentials, and all activity that
            occurs under your account.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Your content.</span> You
            retain ownership of your videos and transcripts. You grant Rendivia a
            limited license to process your content to provide the service.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Acceptable use.</span>{" "}
            Do not upload unlawful content or use Rendivia to violate the rights
            of others, abuse the platform, or attempt to bypass usage limits.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Plans and billing.</span>{" "}
            Paid plans include usage limits and features. If you exceed usage
            limits, we may require an upgrade or additional fees. Billing
            terms are provided at checkout.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Availability.</span>{" "}
            We strive for reliable service, but availability is not guaranteed.
            Enterprise plans may include SLAs in a separate agreement.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Termination.</span> You
            may stop using the service at any time. We may suspend or terminate
            accounts that violate these Terms.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Disclaimer.</span> The
            service is provided “as is” without warranties. To the maximum
            extent allowed by law, Rendivia is not liable for indirect or
            consequential damages.
          </p>
          <p>
            <span className="font-medium text-zinc-900">Contact.</span> Email{" "}
            <a
              href="mailto:founders@rendivia.ai"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              founders@rendivia.ai
            </a>{" "}
            with questions about these Terms.
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
