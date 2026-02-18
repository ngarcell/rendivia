"use client";

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  OffthreadVideo,
  getRemotionEnvironment,
} from "remotion";
import { Video } from "@remotion/media";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import type { CaptionStyle, TimelineClip } from "@/lib/caption-edits";
import { loadGoogleFont } from "@/lib/google-fonts";

export interface CaptionVideoProps {
  captions: Caption[];
  timeline: TimelineClip[];
  style: CaptionStyle;
  videoSrc?: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
}

function CaptionOverlay({
  pages,
  style,
  clipStartMs,
}: {
  pages: ReturnType<typeof createTikTokStyleCaptions>["pages"];
  style: CaptionStyle;
  clipStartMs: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = clipStartMs + (frame / fps) * 1000;

  const activePage = pages.find(
    (page) => currentMs >= page.startMs && currentMs <= page.startMs + page.durationMs
  );

  if (!activePage) return null;

  const opacity = interpolate(
    frame,
    [0, Math.floor(fps * 0.12)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const positionStyle: React.CSSProperties =
    style.position === "top"
      ? { justifyContent: "flex-start", paddingTop: 120 }
      : style.position === "center"
        ? { justifyContent: "center" }
        : { justifyContent: "flex-end", paddingBottom: 140 };

  return (
    <AbsoluteFill
      style={{
        ...positionStyle,
        alignItems: "center",
        paddingLeft: 72,
        paddingRight: 72,
      }}
    >
      <div
        style={{
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight ?? 600,
          color: style.primaryColor,
          textShadow: style.textShadow ?? "none",
          opacity,
          textAlign: "center",
          whiteSpace: "pre",
          lineHeight: 1.25,
          maxWidth: "92%",
        }}
      >
        {activePage.tokens.map((token, index) => {
          const isActive = currentMs >= token.fromMs && currentMs <= token.toMs;
          return (
            <span
              key={`${token.fromMs}-${index}`}
              style={
                isActive
                  ? {
                      color: style.highlightColor,
                    }
                  : undefined
              }
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

export const CaptionVideo: React.FC<CaptionVideoProps> = ({
  captions,
  timeline,
  style,
  videoSrc,
}) => {
  const { fps } = useVideoConfig();
  const env = getRemotionEnvironment();

  const resolvedFont = useMemo(
    () => loadGoogleFont(style.fontFamily),
    [style.fontFamily]
  );

  const resolvedStyle = useMemo(
    () => ({ ...style, fontFamily: resolvedFont }),
    [style, resolvedFont]
  );

  const pages = useMemo(() => {
    return createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: 1200,
    }).pages;
  }, [captions]);

  const VideoTag = env.isPlayer ? Video : OffthreadVideo;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timeline
        .reduce<{ clip: TimelineClip; from: number; durationFrames: number }[]>(
          (acc, clip) => {
            const durationFrames = Math.max(1, Math.round((clip.end - clip.start) * fps));
            const from = acc.length
              ? acc[acc.length - 1].from + acc[acc.length - 1].durationFrames
              : 0;
            acc.push({ clip, from, durationFrames });
            return acc;
          },
          []
        )
        .map(({ clip, from, durationFrames }) => {
        return (
          <Sequence key={clip.id} from={from} durationInFrames={durationFrames}>
            <AbsoluteFill>
              {videoSrc ? (
                <VideoTag
                  src={videoSrc}
                  startFrom={Math.round(clip.start * fps)}
                  endAt={Math.round(clip.end * fps)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </AbsoluteFill>
              <CaptionOverlay
                pages={pages}
                style={resolvedStyle}
                clipStartMs={clip.start * 1000}
              />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
