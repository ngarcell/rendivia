"use client";

import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { RenderBrand } from "@/lib/brand-profile";

export type PseoMetric = {
  label: string;
  value: number;
  display?: string;
};

export type PseoStep = { title: string; body: string };

export interface PseoDemoVideoProps {
  title: string;
  subtitle: string;
  templateId: string;
  problem: string[];
  solution: string[];
  inputJson: Record<string, unknown>;
  outputBullets: string[];
  steps: PseoStep[];
  metrics: PseoMetric[];
  brand: RenderBrand;
  durationSeconds?: number;
}

const SectionTitle: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <h2 style={{ fontSize: 28, fontWeight: 700, color }}>{children}</h2>
);

const BulletList: React.FC<{ bullets: string[]; color: string }> = ({ bullets, color }) => (
  <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
    {bullets.map((bullet) => (
      <li key={bullet} style={{ fontSize: 18, color }}>
        {bullet}
      </li>
    ))}
  </ul>
);

const MetricBars: React.FC<{ metrics: PseoMetric[]; brand: RenderBrand }> = ({ metrics, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxValue = Math.max(...metrics.map((m) => m.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      {metrics.map((metric, index) => {
        const delay = index * 8;
        const progress = interpolate(
          frame,
          [delay, delay + fps * 0.5],
          [0, metric.value / maxValue],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div key={metric.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 180, fontSize: 16, color: brand.colors.secondary }}>
              {metric.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 16,
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.max(6, progress * 100)}%`,
                  backgroundColor: brand.colors.accent,
                  borderRadius: 999,
                }}
              />
            </div>
            <span style={{ width: 80, textAlign: "right", fontSize: 16, color: brand.colors.primary }}>
              {metric.display ?? metric.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

function formatJson(input: Record<string, unknown>): string {
  const raw = JSON.stringify(input, null, 2);
  const lines = raw.split("\n");
  return lines.slice(0, 10).join("\n");
}

const PseoDemoVideo: React.FC<PseoDemoVideoProps> = ({
  title,
  subtitle,
  templateId,
  problem,
  solution,
  inputJson,
  outputBullets,
  steps,
  metrics,
  brand,
  durationSeconds = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const totalFrames = Math.max(1, Math.round(durationSeconds * fps));

  const introFrames = fps * 4;
  const metricsFrames = fps * 9;
  const problemFrames = fps * 6;
  const solutionFrames = fps * 6;
  const ioFrames = fps * 7;
  const flowFrames = fps * 6;
  const ctaFrames = Math.max(1, totalFrames - (introFrames + metricsFrames + problemFrames + solutionFrames + ioFrames + flowFrames));

  const sectionStarts = {
    intro: 0,
    metrics: introFrames,
    problem: introFrames + metricsFrames,
    solution: introFrames + metricsFrames + problemFrames,
    io: introFrames + metricsFrames + problemFrames + solutionFrames,
    flow: introFrames + metricsFrames + problemFrames + solutionFrames + ioFrames,
    cta: introFrames + metricsFrames + problemFrames + solutionFrames + ioFrames + flowFrames,
  };

  const fade = (start: number) =>
    interpolate(frame, [start, start + fps * 0.5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const inputSnippet = formatJson(inputJson);
  const safeMetrics = metrics.length > 0 ? metrics : [{ label: "Metric", value: 1, display: "1" }];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.background,
        color: brand.colors.primary,
        fontFamily: brand.fontFamily,
        padding: 48,
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
        }}
      >
        {brand.logoUrl ? (
          <Img
            src={brand.logoUrl}
            style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: brand.colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: brand.colors.primary,
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {brand.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div style={{ fontSize: 14, color: brand.colors.secondary }}>{brand.name}</div>
      </div>

      <Sequence from={sectionStarts.intro} durationInFrames={introFrames}>
        <div style={{ opacity: fade(sectionStarts.intro) }}>
          <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: brand.colors.secondary }}>
            Programmatic video demo
          </p>
          <h1 style={{ fontSize: 46, fontWeight: 700, marginTop: 12, maxWidth: 900 }}>{title}</h1>
          <p style={{ fontSize: 22, marginTop: 12, maxWidth: 900, color: brand.colors.secondary }}>{subtitle}</p>
        </div>
      </Sequence>

      <Sequence from={sectionStarts.metrics} durationInFrames={metricsFrames}>
        <div style={{ opacity: fade(sectionStarts.metrics) }}>
          <SectionTitle color={brand.colors.primary}>Key metrics</SectionTitle>
          <p style={{ marginTop: 8, color: brand.colors.secondary }}>
            Data-driven visuals pulled directly from the JSON payload.
          </p>
          <div style={{ marginTop: 20 }}>
            <MetricBars metrics={safeMetrics} brand={brand} />
          </div>
        </div>
      </Sequence>

      <Sequence from={sectionStarts.problem} durationInFrames={problemFrames}>
        <div style={{ opacity: fade(sectionStarts.problem) }}>
          <SectionTitle color={brand.colors.primary}>Problem</SectionTitle>
          <BulletList bullets={problem.slice(0, 3)} color={brand.colors.secondary} />
        </div>
      </Sequence>

      <Sequence from={sectionStarts.solution} durationInFrames={solutionFrames}>
        <div style={{ opacity: fade(sectionStarts.solution) }}>
          <SectionTitle color={brand.colors.primary}>Solution</SectionTitle>
          <BulletList bullets={solution.slice(0, 3)} color={brand.colors.secondary} />
        </div>
      </Sequence>

      <Sequence from={sectionStarts.io} durationInFrames={ioFrames}>
        <div style={{ opacity: fade(sectionStarts.io), display: "grid", gap: 20, gridTemplateColumns: "1.2fr 1fr" }}>
          <div>
            <SectionTitle color={brand.colors.primary}>Input JSON</SectionTitle>
            <pre
              style={{
                marginTop: 12,
                backgroundColor: "rgba(255,255,255,0.08)",
                padding: 16,
                borderRadius: 12,
                fontSize: 13,
                color: brand.colors.secondary,
                lineHeight: 1.4,
                maxHeight: height * 0.42,
                overflow: "hidden",
              }}
            >
              {inputSnippet}
            </pre>
          </div>
          <div>
            <SectionTitle color={brand.colors.primary}>Output</SectionTitle>
            <BulletList bullets={outputBullets.slice(0, 3)} color={brand.colors.secondary} />
          </div>
        </div>
      </Sequence>

      <Sequence from={sectionStarts.flow} durationInFrames={flowFrames}>
        <div style={{ opacity: fade(sectionStarts.flow) }}>
          <SectionTitle color={brand.colors.primary}>End-to-end flow</SectionTitle>
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            {steps.slice(0, 4).map((step, index) => (
              <div
                key={step.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    backgroundColor: brand.colors.accent,
                    color: brand.colors.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>{step.title}</p>
                  <p style={{ fontSize: 14, color: brand.colors.secondary }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Sequence>

      <Sequence from={sectionStarts.cta} durationInFrames={ctaFrames}>
        <div style={{ opacity: fade(sectionStarts.cta) }}>
          <SectionTitle color={brand.colors.primary}>Generate via API</SectionTitle>
          <p style={{ marginTop: 12, fontSize: 18, color: brand.colors.secondary }}>
            Template: {templateId} • Deterministic output in 30-45 seconds.
          </p>
          <p style={{ marginTop: 8, fontSize: 16, color: brand.colors.secondary }}>
            Trigger a render when data is ready. Receive MP4 + webhook.
          </p>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export default PseoDemoVideo;
