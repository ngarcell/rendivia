import type { WordSegment } from "@/remotion/WordSegment";

export interface TrimSilenceOptions {
  /** Min gap (seconds) to consider silence and trim */
  silenceThresholdSeconds?: number;
  /** Keep at least this much padding around speech */
  paddingSeconds?: number;
}

/**
 * Merge segments that are very close and drop long silences.
 * Returns new word segments with adjusted start/end (no actual audio cutting;
 * for full cut use FFmpeg; this just adjusts caption timing).
 */
export function trimSilenceFromSegments(
  segments: { text: string; start: number; end: number }[],
  options: TrimSilenceOptions = {}
): { text: string; start: number; end: number }[] {
  const threshold = options.silenceThresholdSeconds ?? 0.5;
  const padding = options.paddingSeconds ?? 0.05;
  if (segments.length === 0) return [];

  const out: { text: string; start: number; end: number }[] = [];
  let current = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const gap = seg.start - current.end;
    if (gap <= threshold) {
      current.text = `${current.text} ${seg.text}`.trim();
      current.end = seg.end;
    } else {
      out.push(current);
      current = { ...seg };
    }
  }
  out.push(current);

  return out.map((s) => ({
    ...s,
    start: Math.max(0, s.start - padding),
    end: s.end + padding,
  }));
}

export function segmentsToWordSegments(
  segments: { text: string; start: number; end: number }[]
): WordSegment[] {
  const words: WordSegment[] = [];
  for (const seg of segments) {
    const tokens = seg.text.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const duration = (seg.end - seg.start) / tokens.length;
    tokens.forEach((word, i) => {
      words.push({
        word,
        start: seg.start + i * duration,
        end: seg.start + (i + 1) * duration,
      });
    });
  }
  return words;
}
