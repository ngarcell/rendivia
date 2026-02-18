type LogoDirection = "corporate" | "modern";

export type BrandLogoProps = {
  showTagline?: boolean;
  markClassName?: string;
  wordmarkClassName?: string;
  taglineClassName?: string;
  className?: string;
  variant?: LogoDirection;
};

function cx(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function BrandLogo({
  showTagline = false,
  markClassName,
  wordmarkClassName,
  taglineClassName,
  className,
  variant = "modern",
}: BrandLogoProps) {
  return (
    <span className={cx("inline-flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 48 48"
        role="img"
        aria-hidden
        className={cx(
          "h-10 w-10 shrink-0 rounded-xl shadow-[0_8px_20px_rgba(15,23,42,0.22)]",
          markClassName
        )}
      >
        {variant === "corporate" ? (
          <>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="#0f172a" />
            <rect
              x="2.5"
              y="2.5"
              width="43"
              height="43"
              rx="11.5"
              fill="none"
              stroke="#1e293b"
            />
            <path
              d="M14 11h12.5c6.4 0 10.7 4.1 10.7 10.1 0 4.5-2.5 7.9-6.7 9.4L36.4 38h-7.3l-4.8-6.9H21V38h-7V11Zm7 5.9v8.4h4.7c2.8 0 4.5-1.7 4.5-4.2s-1.7-4.2-4.5-4.2H21Z"
              fill="#f8fafc"
            />
            <circle cx="34.4" cy="13.6" r="2.8" fill="#38bdf8" />
          </>
        ) : (
          <>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="#0b1220" />
            <rect
              x="2.5"
              y="2.5"
              width="43"
              height="43"
              rx="11.5"
              fill="none"
              stroke="#1f2a3d"
            />
            <path d="M11 39L20.6 9h5.8L16.8 39H11Z" fill="#60a5fa" />
            <path d="M21 39L30.6 9h5.8L26.8 39H21Z" fill="#22d3ee" />
            <path d="M33 18.5L40.5 24L33 29.5V18.5Z" fill="#e2e8f0" />
            <circle cx="37.5" cy="12.5" r="2.5" fill="#67e8f9" />
          </>
        )}
      </svg>

      <span className="flex flex-col leading-none">
        <span
          className={cx(
            "text-[15px] font-semibold tracking-[0.14em] text-zinc-900",
            wordmarkClassName
          )}
        >
          RENDIVIA
        </span>
        {showTagline ? (
          <span
            className={cx(
              "hidden text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:block",
              taglineClassName
            )}
          >
            Programmatic Video API
          </span>
        ) : null}
      </span>
    </span>
  );
}
