"use client";

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const BG_DARK = "#0f172a";
const BG_LIGHT = "#f8fafc";
const TEXT_PRIMARY = "#0f172a";
const TEXT_SECONDARY = "#475569";
const ACCENT = "#2563eb";

const CODE_BG = "#0b1220";
const CODE_BORDER = "rgba(148,163,184,0.25)";
const CODE_TEXT = "#e2e8f0";
const CODE_MUTED = "#94a3b8";

const fpsDefault = 30;

function fade(frame: number, start: number, duration = 12) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideY(frame: number, start: number, distance = 12, duration = 12) {
  return interpolate(frame, [start, start + duration], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

const GridBackground = ({ dark = false }: { dark?: boolean }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: dark ? BG_DARK : BG_LIGHT,
      backgroundImage: dark
        ? "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)"
        : "linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)",
      backgroundSize: "48px 48px",
    }}
  />
);

const DashboardStack = ({ frame, start }: { frame: number; start: number }) => {
  const opacity = fade(frame, start);
  const translate = slideY(frame, start, 18);
  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        opacity,
        transform: `translateY(${translate}px)`,
      }}
    >
      {["Dashboard", "Chart", "Table"].map((label, index) => (
        <div
          key={label}
          style={{
            width: 460,
            height: 120,
            borderRadius: 16,
            background: "#eef2f7",
            border: "1px solid rgba(15,23,42,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
            opacity: 0.9 - index * 0.1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: TEXT_PRIMARY,
                letterSpacing: 0.3,
              }}
            >
              {label}
            </div>
            <div style={{ marginTop: 8, fontSize: 14, color: TEXT_SECONDARY }}>
              Static snapshot
            </div>
          </div>
          <div
            style={{
              width: 100,
              height: 6 + index * 2,
              borderRadius: 999,
              background: "rgba(148,163,184,0.6)",
            }}
          />
        </div>
      ))}
    </div>
  );
};

const ReportStack = ({ frame, start }: { frame: number; start: number }) => {
  const opacity = fade(frame, start);
  const translate = slideY(frame, start, 18);
  return (
    <div
      style={{
        display: "grid",
        gap: 14,
        opacity,
        transform: `translateY(${translate}px)`,
      }}
    >
      {["PDF report", "Email summary", "Spreadsheet"].map((label, index) => (
        <div
          key={label}
          style={{
            width: 340,
            height: 78,
            borderRadius: 14,
            background: "#f1f5f9",
            border: "1px solid rgba(148,163,184,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
            opacity: 0.9 - index * 0.08,
          }}
        >
          <span style={{ fontSize: 16, color: TEXT_PRIMARY, fontWeight: 600 }}>{label}</span>
          <span
            style={{
              fontSize: 12,
              color: TEXT_SECONDARY,
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(148,163,184,0.2)",
            }}
          >
            Manual
          </span>
        </div>
      ))}
    </div>
  );
};

const CodePanel = ({ frame, start }: { frame: number; start: number }) => {
  const opacity = fade(frame, start);
  const translate = slideY(frame, start, 16);
  return (
    <div
      style={{
        width: 560,
        borderRadius: 16,
        border: `1px solid ${CODE_BORDER}`,
        background: CODE_BG,
        padding: 20,
        fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
        color: CODE_TEXT,
        opacity,
        transform: `translateY(${translate}px)`,
        boxShadow: "0 24px 60px rgba(15,23,42,0.4)",
      }}
    >
      <div style={{ color: CODE_MUTED, fontSize: 14 }}>POST /render</div>
      <pre style={{ marginTop: 12, fontSize: 15, lineHeight: 1.5, color: CODE_TEXT }}>
{`{
  "template": "weekly-summary",
  "data": {
    "users": 1243,
    "revenue": 8920,
    "growth": "+12%"
  }
}`}
      </pre>
    </div>
  );
};

const OutputPreview = ({ frame, start }: { frame: number; start: number }) => {
  const opacity = fade(frame, start);
  const translate = slideY(frame, start, 16);
  const barProgress = interpolate(frame, [start + 10, start + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width: 560,
        borderRadius: 18,
        border: "1px solid rgba(148,163,184,0.3)",
        background: "#0b1220",
        padding: 20,
        color: "#e2e8f0",
        opacity,
        transform: `translateY(${translate}px)`,
        boxShadow: "0 24px 60px rgba(15,23,42,0.35)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>Weekly summary</div>
      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {[
          { label: "Users", value: 1243 },
          { label: "Revenue", value: 8920 },
          { label: "Growth", value: 12 },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 140, fontSize: 14, color: "#cbd5f5" }}>{item.label}</span>
            <div style={{ flex: 1, height: 12, borderRadius: 999, background: "rgba(255,255,255,0.1)" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.max(6, barProgress * 100)}%`,
                  borderRadius: 999,
                  background: ACCENT,
                }}
              />
            </div>
            <span style={{ width: 70, textAlign: "right", fontSize: 14 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LandingHeroVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps = fpsDefault, width } = useVideoConfig();

  const scene1 = 0;
  const scene2 = fps * 4.5;
  const scene3 = fps * 10.5;
  const scene4 = fps * 21;
  const scene5 = fps * 30;
  const scene6 = fps * 39;

  const scale = width / 1280;

  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div
        style={{
          width: 1280,
          height: 720,
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <GridBackground />

        <Sequence from={scene1} durationInFrames={fps * 4.5}>
          <div style={{ position: "absolute", left: 120, top: 140 }}>
            <DashboardStack frame={frame} start={scene1} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 120,
              top: 170,
              maxWidth: 500,
            }}
          >
            <div style={{ opacity: fade(frame, scene1), transform: `translateY(${slideY(frame, scene1)}px)` }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: TEXT_PRIMARY }}>
                Your product already has the data.
              </div>
              <div style={{ marginTop: 16, fontSize: 22, color: TEXT_SECONDARY }}>
                But insights are still delivered manually.
              </div>
            </div>
          </div>
        </Sequence>

        <Sequence from={scene2} durationInFrames={fps * 6}>
          <div style={{ position: "absolute", left: 160, top: 180 }}>
            <ReportStack frame={frame} start={scene2} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 120,
              top: 200,
              maxWidth: 440,
            }}
          >
            <div style={{ opacity: fade(frame, scene2), transform: `translateY(${slideY(frame, scene2)}px)` }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: TEXT_PRIMARY }}>Reports are ignored.</div>
              <div style={{ marginTop: 12, fontSize: 24, color: TEXT_SECONDARY }}>
                Manual videos do not scale.
              </div>
            </div>
          </div>
        </Sequence>

        <Sequence from={scene3} durationInFrames={fps * 10.5}>
          <GridBackground dark />
          <div style={{ position: "absolute", left: 120, top: 140 }}>
            <CodePanel frame={frame} start={scene3} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 120,
              top: 180,
              maxWidth: 420,
            }}
          >
            <div style={{ opacity: fade(frame, scene3), transform: `translateY(${slideY(frame, scene3)}px)` }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: "#e2e8f0" }}>
                Rendivia turns structured data into video.
              </div>
              <div style={{ marginTop: 12, fontSize: 22, color: "#94a3b8" }}>
                Using a simple API.
              </div>
            </div>
          </div>
        </Sequence>

        <Sequence from={scene4} durationInFrames={fps * 9}>
          <GridBackground dark />
          <div style={{ position: "absolute", left: 120, top: 150 }}>
            <OutputPreview frame={frame} start={scene4} />
          </div>
          <div
            style={{
              position: "absolute",
              right: 120,
              top: 190,
              maxWidth: 360,
            }}
          >
            <div style={{ opacity: fade(frame, scene4), transform: `translateY(${slideY(frame, scene4)}px)` }}>
              <div style={{ fontSize: 34, fontWeight: 700, color: "#e2e8f0" }}>What it produces</div>
              <div
                style={{
                  marginTop: 20,
                  display: "grid",
                  gap: 10,
                  fontSize: 20,
                  color: "#cbd5f5",
                }}
              >
                {[
                  "Branded MP4 video",
                  "Deterministic output",
                  "Generated asynchronously",
                  "Delivered via webhook",
                ].map((item, index) => (
                  <div
                    key={item}
                    style={{
                      opacity: fade(frame, scene4 + 8 + index * 6),
                      transform: `translateY(${slideY(frame, scene4 + 8 + index * 6, 8)}px)`,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Sequence>

        <Sequence from={scene5} durationInFrames={fps * 9}>
          <div style={{ position: "absolute", left: 140, top: 190, maxWidth: 520 }}>
            <div style={{ opacity: fade(frame, scene5), transform: `translateY(${slideY(frame, scene5)}px)` }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: TEXT_PRIMARY }}>For SaaS products.</div>
              <div style={{ marginTop: 10, fontSize: 28, color: TEXT_SECONDARY }}>
                For recurring workflows.
              </div>
              <div style={{ marginTop: 10, fontSize: 28, color: TEXT_SECONDARY }}>
                For teams that ship.
              </div>
              <div style={{ marginTop: 16, fontSize: 20, color: TEXT_SECONDARY }}>
                Reports. Metrics. Events. Summaries.
              </div>
            </div>
          </div>
        </Sequence>

        <Sequence from={scene6} durationInFrames={fps * 6}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: fade(frame, scene6),
            }}
          >
            <div
              style={{
                fontSize: 18,
                letterSpacing: 2,
                color: TEXT_SECONDARY,
                marginBottom: 12,
              }}
            >
              RENDIVIA
            </div>
            <div style={{ fontSize: 44, fontWeight: 700, color: TEXT_PRIMARY, textAlign: "center" }}>
              Programmatic video generation for SaaS products.
            </div>
            <div style={{ marginTop: 18, fontSize: 22, color: TEXT_SECONDARY }}>
              Get an API key.
            </div>
          </div>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

export default LandingHeroVideo;
