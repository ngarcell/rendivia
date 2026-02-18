"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackedLinkProps {
  href: string;
  eventName: string;
  eventProps?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export default function TrackedLink({
  href,
  eventName,
  eventProps,
  className,
  children,
  onClick,
}: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackEvent(eventName, eventProps ?? {});
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
}
