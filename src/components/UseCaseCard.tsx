import Link from "next/link";

interface UseCaseCardProps {
  title: string;
  description: string;
  href: string;
}

export default function UseCaseCard({ title, description, href }: UseCaseCardProps) {
  return (
    <Link
      href={href}
      className="surface-card group p-6 transition hover:-translate-y-0.5 hover:border-zinc-300"
    >
      <h3 className="text-base font-semibold text-zinc-900 group-hover:text-[var(--accent)]">
        {title}
      </h3>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
      <span className="mt-4 inline-flex text-xs font-semibold text-[var(--accent)]">
        View use case {"->"}
      </span>
    </Link>
  );
}
