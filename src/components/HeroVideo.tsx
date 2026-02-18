"use client";

import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
  poster?: string;
  mp4Src: string;
  webmSrc?: string;
  className?: string;
}

function resolveAutoPlay(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  const saveData = connection?.saveData;
  const slowConnection = connection?.effectiveType ? /2g/.test(connection.effectiveType) : false;

  return !(prefersReduced || saveData || slowConnection);
}

export default function HeroVideo({
  poster = "/landing/rendivia-landing-poster.svg",
  mp4Src,
  webmSrc,
  className,
}: HeroVideoProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [autoPlay] = useState<boolean>(() => resolveAutoPlay());

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      <video
        className="h-full w-full"
        muted
        loop
        autoPlay={autoPlay && shouldLoad}
        playsInline
        preload={autoPlay ? "metadata" : "none"}
        poster={poster}
        aria-label="Rendivia programmatic video generation overview"
      >
        {shouldLoad && webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
        {shouldLoad ? <source src={mp4Src} type="video/mp4" /> : null}
      </video>
    </div>
  );
}
