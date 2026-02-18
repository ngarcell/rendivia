export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

export function trackEvent(name: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      name,
      properties,
      path: window.location.pathname,
      ts: new Date().toISOString(),
    };

    if ((window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer) {
      (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer?.push({
        event: name,
        ...properties,
      });
    }

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // ignore analytics errors
  }
}
