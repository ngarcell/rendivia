import Link from "next/link";
import { ARCHITECTURE_DIAGRAM } from "@/data/pseo-api";
import { SeoBreadcrumbJsonLd } from "@/components/SeoBreadcrumbJsonLd";

interface PseoPageTemplateProps {
  title: string;
  description: string;
  inputLabel: string;
  outputLabel: string;
  jsonExample: string;
  canonicalPath?: string;
}

const HOW_IT_WORKS = [
  "Send structured JSON with a template ID and data payload.",
  "Rendivia renders a deterministic MP4 using Remotion templates.",
  "Receive a webhook and download the branded video.",
];

export default function PseoPageTemplate({
  title,
  description,
  inputLabel,
  outputLabel,
  jsonExample,
  canonicalPath,
}: PseoPageTemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      <SeoBreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Alternatives", href: "/alternatives" },
          { name: title, href: canonicalPath ?? "/alternatives" },
        ]}
      />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Programmatic video generation
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl title-animate">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            {description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-2xl border border-zinc-200 bg-[var(--muted-bg)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Input</p>
              <p className="mt-2 text-sm font-medium text-zinc-900">{inputLabel}</p>
            </div>
            <div className="hidden text-center text-sm font-semibold text-zinc-400 sm:block">-&gt;</div>
            <div className="rounded-2xl border border-zinc-200 bg-[var(--muted-bg)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Output</p>
              <p className="mt-2 text-sm font-medium text-zinc-900">{outputLabel}</p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-base font-semibold text-zinc-900">Concrete JSON example</h2>
            <pre className="mt-3 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-950 p-4 text-xs text-zinc-100">
              {jsonExample}
            </pre>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-semibold text-zinc-900">Architecture</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-[var(--muted-bg)] p-4 text-xs text-zinc-600">
              {ARCHITECTURE_DIAGRAM}
            </pre>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-semibold text-zinc-900">How it works</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              {HOW_IT_WORKS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <div className="mt-10">
            <Link
              href="/dashboard/api-keys"
              className="touch-target inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] sm:w-auto"
            >
              Get API key
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
