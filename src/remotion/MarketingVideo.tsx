import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface MarketingVideoProps {
  title: string;
  subtitle: string;
  bullets: string[];
  cta: string;
  badge?: string;
  accentColor?: string;
  backgroundFrom?: string;
  backgroundTo?: string;
}

export const MarketingVideo: React.FC<MarketingVideoProps> = ({
  title,
  subtitle,
  bullets,
  cta,
  badge = "Rendivia",
  accentColor = "#2563eb",
  backgroundFrom = "#0f172a",
  backgroundTo = "#1e293b",
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const intro = spring({ frame, fps, config: { damping: 200, stiffness: 120 } });
  const fade = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const stagger = (index: number) =>
    spring({ frame: Math.max(0, frame - index * 6), fps, config: { damping: 200, stiffness: 140 } });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${backgroundFrom}, ${backgroundTo})`,
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: width * 0.08,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 14px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          fontSize: 18,
          textTransform: "uppercase",
          letterSpacing: 2,
          opacity: fade,
          transform: `translateY(${(1 - intro) * 12}px)`,
          width: "fit-content",
        }}
      >
        {badge}
      </div>

      <h1
        style={{
          fontSize: 64,
          lineHeight: 1.05,
          marginTop: 24,
          marginBottom: 16,
          fontWeight: 700,
          opacity: fade,
          transform: `translateY(${(1 - intro) * 18}px)`,
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: 26,
          maxWidth: width * 0.72,
          color: "#cbd5f5",
          lineHeight: 1.4,
          marginBottom: 28,
          opacity: fade,
        }}
      >
        {subtitle}
      </p>

      <div style={{ display: "grid", gap: 14, maxWidth: width * 0.7 }}>
        {bullets.slice(0, 4).map((item, index) => (
          <div
            key={`${item}-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              color: "#e2e8f0",
              opacity: stagger(index),
              transform: `translateY(${(1 - stagger(index)) * 14}px)`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: accentColor,
                display: "inline-block",
                boxShadow: `0 0 12px ${accentColor}`,
              }}
            />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 36,
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 22px",
          borderRadius: 14,
          background: accentColor,
          color: "#ffffff",
          fontWeight: 600,
          fontSize: 22,
          width: "fit-content",
          boxShadow: `0 12px 30px rgba(37,99,235,0.35)`,
          opacity: fade,
        }}
      >
        {cta}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 28,
          fontSize: 14,
          color: "rgba(248,250,252,0.7)",
        }}
      >
        Generated with Rendivia + Remotion
      </div>
    </div>
  );
};
