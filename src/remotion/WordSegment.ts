export interface WordSegment {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

export function parseWhisperSegments(segments: { text: string; start: number; end: number }[]): WordSegment[] {
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
