import Link from "next/link";

interface CTASectionProps {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
}

export default function CTASection({ title, body, primaryLabel, primaryHref }: CTASectionProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600">{body}</p>
      <Link
        href={primaryHref}
        className="touch-target mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
      >
        {primaryLabel}
      </Link>
    </div>
  );
}
