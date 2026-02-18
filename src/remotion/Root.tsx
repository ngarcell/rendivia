import React from "react";
import { Composition, registerRoot } from "remotion";
import { CaptionVideo } from "./CaptionVideo";
import DataReportVideo from "./DataReportVideo";
import { MarketingVideo } from "./MarketingVideo";
import LandingHeroVideo from "./LandingHeroVideo";
import PseoDemoVideo from "./PseoDemoVideo";
import type { WordSegment } from "./WordSegment";
import type { RenderBrand } from "@/lib/brand-profile";
import { DEFAULT_RENDER_BRAND } from "@/lib/brand-profile";
import { DEFAULT_BRAND_PRESET } from "@/lib/brand-preset";
import {
  createDefaultEdits,
  getAspectRatioDimensions,
  getTimelineDurationSeconds,
  type AspectRatio,
  type CaptionEdits,
} from "@/lib/caption-edits";

export interface CaptionVideoInputProps {
  captions: CaptionEdits["captions"];
  timeline: CaptionEdits["timeline"];
  style: CaptionEdits["style"];
  videoSrc?: string;
  aspectRatio: AspectRatio;
}

const defaultWords: WordSegment[] = [
  { word: "Hello", start: 0, end: 0.5 },
  { word: "world", start: 0.5, end: 1 },
];

const defaultBrand: RenderBrand = {
  ...DEFAULT_RENDER_BRAND,
  name: "Rendivia",
};

const defaultData = [
  { label: "Views", value: 1200, color: defaultBrand.colors.accent },
  { label: "Likes", value: 340, color: "#3b82f6" },
  { label: "Shares", value: 89, color: "#a855f7" },
];

const defaultEdits = createDefaultEdits(defaultWords, DEFAULT_BRAND_PRESET, "9:16");
const defaultMarketingProps = {
  title: "Turn webinars into short clips",
  subtitle: "Rendivia transcribes long-form video and renders branded captions for Shorts, Reels, and TikTok.",
  bullets: [
    "Clip suggestions from long-form content",
    "Word-level captions with brand presets",
    "Render-ready 9:16 exports in minutes",
  ],
  cta: "Create clips in Rendivia",
  badge: "Rendivia",
  accentColor: "#2563eb",
  backgroundFrom: "#0f172a",
  backgroundTo: "#1e293b",
};

const defaultPseoDemoProps = {
  title: "Weekly metrics video for SaaS",
  subtitle: "Deterministic, branded video summaries rendered from JSON data.",
  templateId: "weekly-summary-v1",
  problem: [
    "Dashboards are ignored by busy teams.",
    "Manual video recaps do not scale.",
    "Insights need a clear narrative.",
  ],
  solution: [
    "POST structured data to the Render API.",
    "Queue-based rendering with webhooks.",
    "Consistent output every time.",
  ],
  inputJson: {
    template: "weekly-summary-v1",
    data: { users: 1243, revenue: 8920, growth: "12%" },
    brand: "rendivia",
  },
  outputBullets: [
    "30-45s MP4 video",
    "Brand styling applied",
    "Webhook with output URL",
  ],
  steps: [
    { title: "Send data", body: "POST JSON to /render with your API key." },
    { title: "Queue render", body: "We render asynchronously at scale." },
    { title: "Deliver", body: "Receive the MP4 URL via webhook." },
    { title: "Distribute", body: "Embed in-app or send via email." },
  ],
  metrics: [
    { label: "Users", value: 1243, display: "1243" },
    { label: "Revenue", value: 8920, display: "8920" },
    { label: "Growth", value: 12, display: "12%" },
  ],
  brand: defaultBrand,
  durationSeconds: 40,
};

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionVideo"
        component={CaptionVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          captions: defaultEdits.captions,
          timeline: defaultEdits.timeline,
          style: defaultEdits.style,
          videoSrc: undefined,
          aspectRatio: defaultEdits.aspectRatio,
        }}
        calculateMetadata={({ props }) => {
          const input = props as unknown as CaptionVideoInputProps;
          const durationSeconds = getTimelineDurationSeconds(input.timeline ?? []);
          const { width, height } = getAspectRatioDimensions(input.aspectRatio ?? "9:16");
          return {
            durationInFrames: Math.ceil(durationSeconds * 30),
            width,
            height,
            props,
          };
        }}
      />
      <Composition
        id="DataReportVideo"
        component={DataReportVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Monthly Report",
          data: defaultData,
          brand: defaultBrand,
          durationSeconds: 15,
        }}
      />
      <Composition
        id="MarketingVideo"
        component={MarketingVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
        defaultProps={defaultMarketingProps}
      />
      <Composition
        id="LandingHeroVideo"
        component={LandingHeroVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={1350}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="LandingHeroVideo1080p"
        component={LandingHeroVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LandingHeroVideo4k"
        component={LandingHeroVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={1350}
        fps={30}
        width={3840}
        height={2160}
      />
      <Composition
        id="PseoDemoVideo"
        component={PseoDemoVideo as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={1200}
        fps={30}
        width={1280}
        height={720}
        defaultProps={defaultPseoDemoProps}
        calculateMetadata={({ props }) => {
          const input = props as { durationSeconds?: number };
          const durationSeconds = Math.max(30, Math.min(45, input.durationSeconds ?? 40));
          return {
            durationInFrames: Math.ceil(durationSeconds * 30),
            width: 1280,
            height: 720,
            props,
          };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
