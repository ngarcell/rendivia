import type { Caption } from "@remotion/captions";
import type { WordSegment } from "@/remotion/WordSegment";
import type { BrandPreset } from "@/lib/brand-preset";

export type AspectRatio = "9:16" | "1:1" | "16:9";

export interface TimelineClip {
  id: string;
  start: number; // seconds
  end: number; // seconds
}

export interface CaptionStyle {
  primaryColor: string;
  highlightColor: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: number;
  textShadow?: string;
  position?: "top" | "center" | "bottom";
}

export interface CaptionEdits {
  version: 1;
  aspectRatio: AspectRatio;
  timeline: TimelineClip[];
  captions: Caption[];
  style: CaptionStyle;
}

export const DEFAULT_ASPECT_RATIO: AspectRatio = "9:16";

export function wordSegmentsToCaptions(words: WordSegment[]): Caption[] {
  return words.map((w, i) => {
    const startMs = Math.max(0, Math.round(w.start * 1000));
    const endMs = Math.max(startMs + 1, Math.round(w.end * 1000));
    return {
      text: `${i === 0 ? "" : " "}${w.word}`,
      startMs,
      endMs,
      timestampMs: Math.round((startMs + endMs) / 2),
      confidence: null,
    } as Caption;
  });
}

export function captionsToTranscript(captions: Caption[]): string {
  return captions.map((c) => c.text).join("").trim();
}

export function reflowCaptionsFromText(
  text: string,
  startMs: number,
  endMs: number
): Caption[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const durationMs = Math.max(1, endMs - startMs);
  const perToken = durationMs / tokens.length;
  return tokens.map((token, i) => {
    const s = Math.round(startMs + perToken * i);
    const e = Math.round(startMs + perToken * (i + 1));
    return {
      text: `${i === 0 ? "" : " "}${token}`,
      startMs: s,
      endMs: Math.max(s + 1, e),
      timestampMs: Math.round((s + e) / 2),
      confidence: null,
    } as Caption;
  });
}

export function getTimelineDurationSeconds(timeline: TimelineClip[]): number {
  if (!timeline.length) return 1;
  return timeline.reduce((acc, clip) => acc + Math.max(0.1, clip.end - clip.start), 0);
}

export function createDefaultEdits(
  words: WordSegment[],
  brand: BrandPreset,
  aspectRatio: AspectRatio = DEFAULT_ASPECT_RATIO
): CaptionEdits {
  const captions = wordSegmentsToCaptions(words);
  const lastEnd = words.length > 0 ? Math.max(...words.map((w) => w.end)) : 1;
  const timeline: TimelineClip[] = [
    {
      id: "clip-1",
      start: 0,
      end: Math.max(1, lastEnd + 0.5),
    },
  ];
  return {
    version: 1,
    aspectRatio,
    timeline,
    captions,
    style: {
      primaryColor: brand.primaryColor,
      highlightColor: brand.highlightColor,
      fontFamily: brand.fontFamily,
      fontSize: brand.fontSize,
      fontWeight: brand.fontWeight,
      textShadow: brand.textShadow,
      position: "bottom",
    },
  };
}

export function normalizeEdits(
  edits: Partial<CaptionEdits> | null | undefined,
  fallback: CaptionEdits
): CaptionEdits {
  if (!edits) return fallback;
  return {
    version: 1,
    aspectRatio: edits.aspectRatio ?? fallback.aspectRatio,
    timeline: edits.timeline && edits.timeline.length > 0 ? edits.timeline : fallback.timeline,
    captions: edits.captions && edits.captions.length > 0 ? edits.captions : fallback.captions,
    style: {
      ...fallback.style,
      ...(edits.style ?? {}),
    },
  };
}

export function getAspectRatioDimensions(aspectRatio: AspectRatio): {
  width: number;
  height: number;
} {
  switch (aspectRatio) {
    case "1:1":
      return { width: 1080, height: 1080 };
    case "16:9":
      return { width: 1920, height: 1080 };
    case "9:16":
    default:
      return { width: 1080, height: 1920 };
  }
}

export interface SilentPart {
  start: number; // seconds
  end: number; // seconds
}

export function applySilentCuts(
  timeline: TimelineClip[],
  silentParts: SilentPart[]
): TimelineClip[] {
  if (timeline.length === 0) return [];
  const cuts = silentParts
    .filter((c) => c.end > c.start)
    .sort((a, b) => a.start - b.start);
  if (cuts.length === 0) return timeline;

  const totalStart = Math.min(...timeline.map((t) => t.start));
  const totalEnd = Math.max(...timeline.map((t) => t.end));
  let cursor = totalStart;
  const next: TimelineClip[] = [];

  for (const cut of cuts) {
    if (cut.start > cursor) {
      next.push({
        id: `clip-${next.length + 1}`,
        start: cursor,
        end: Math.min(cut.start, totalEnd),
      });
    }
    cursor = Math.max(cursor, cut.end);
  }

  if (cursor < totalEnd) {
    next.push({
      id: `clip-${next.length + 1}`,
      start: cursor,
      end: totalEnd,
    });
  }

  return next.length ? next : timeline;
}
