"use client";

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Img } from "remotion";
import type { RenderBrand } from "@/lib/brand-profile";

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface DataReportVideoProps {
  title: string;
  data: DataPoint[];
  brand: RenderBrand;
  durationSeconds?: number;
}

const DataReportVideo: React.FC<DataReportVideoProps> = ({
  title,
  data,
  brand,
  durationSeconds = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const durationFrames = Math.max(1, Math.round(durationSeconds * fps));
  const safeData = data.length > 0 ? data : [{ label: "Value", value: 0 }];

  const titleOpacity = interpolate(
    frame,
    [0, fps * 0.5],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const barProgress = interpolate(
    frame,
    [fps, durationFrames - fps * 2],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const maxValue = Math.max(...safeData.map((d) => d.value), 1);
  const introText = brand.introText?.trim() ? brand.introText.trim() : null;
  const outroText = brand.outroText?.trim() ? brand.outroText.trim() : null;
  const baseFontSize = 48;
  const introDuration = introText ? Math.min(durationFrames * 0.2, fps * 2) : 0;
  const outroDuration = outroText ? Math.min(durationFrames * 0.2, fps * 2) : 0;
  const outroStart = Math.max(0, durationFrames - outroDuration);
  const introOpacity = introText
    ? interpolate(frame, [0, fps * 0.3, introDuration], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const outroOpacity = outroText
    ? interpolate(frame, [outroStart, outroStart + fps * 0.3, durationFrames], [0, 1, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.background,
        padding: 48,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: 0.9,
        }}
      >
        {brand.logoUrl ? (
          <Img
            src={brand.logoUrl}
            style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: brand.colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: brand.colors.primary,
              fontFamily: brand.fontFamily,
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            {brand.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div style={{ color: brand.colors.secondary, fontFamily: brand.fontFamily, fontSize: 16 }}>
          {brand.name}
        </div>
      </div>

      {introText && (
        <div
          style={{
            position: "absolute",
            top: width * 0.12,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: brand.colors.primary,
            fontFamily: brand.fontFamily,
            fontSize: 18,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            opacity: introOpacity,
          }}
        >
          {introText}
        </div>
      )}

      <h1
        style={{
          fontFamily: brand.fontFamily,
          fontSize: Math.min(baseFontSize * 1.2, 64),
          fontWeight: 700,
          color: brand.colors.primary,
          textShadow: "0 10px 30px rgba(0,0,0,0.35)",
          opacity: titleOpacity,
          marginBottom: 48,
          textAlign: "center",
        }}
      >
        {title}
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "80%",
          maxWidth: 600,
        }}
      >
        {safeData.map((point, i) => {
          const delay = i * 0.15;
          const startFrame = fps * (1 + delay);
          const progress = interpolate(
            frame,
            [startFrame, startFrame + fps * 0.5],
            [0, Math.min(1, (point.value / maxValue) * barProgress)],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );
          return (
            <div
              key={point.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: brand.fontFamily,
                  fontSize: baseFontSize * 0.5,
                  color: brand.colors.secondary,
                  width: 120,
                  flexShrink: 0,
                }}
              >
                {point.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 32,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress * 100}%`,
                    backgroundColor: point.color ?? brand.colors.accent,
                    borderRadius: 4,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: brand.fontFamily,
                  fontSize: baseFontSize * 0.5,
                  fontWeight: 600,
                  color: brand.colors.primary,
                  width: 60,
                  textAlign: "right",
                }}
              >
                {point.value}
              </span>
            </div>
          );
        })}
      </div>

      {outroText && (
        <div
          style={{
            position: "absolute",
            bottom: width * 0.08,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 20px",
            borderRadius: 16,
            backgroundColor: "rgba(15,23,42,0.65)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: brand.colors.primary,
            fontFamily: brand.fontFamily,
            fontSize: 20,
            opacity: outroOpacity,
            textAlign: "center",
          }}
        >
          {outroText}
        </div>
      )}
    </AbsoluteFill>
  );
};

export default DataReportVideo;
