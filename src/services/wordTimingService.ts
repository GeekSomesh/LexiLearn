/**
 * Word Timing Service
 * Tracks word-by-word timing during TTS playback to enable synchronized bionic reading.
 */

export interface WordTiming {
  word: string;
  startTime: number; // in milliseconds from audio start
  endTime: number;
  characterIndex: number; // position in original text
}

/**
 * Estimate word timings based on text and audio duration.
 * Simple heuristic: distribute words evenly across the audio duration.
 * For more precise timing, speech-to-text APIs or audio analysis would be needed.
 */
export function estimateWordTimings(text: string, audioDurationMs: number): WordTiming[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return [];

  const timings: WordTiming[] = [];
  const msPerWord = audioDurationMs / words.length;
  let charIndex = 0;

  words.forEach((word, idx) => {
    const startTime = idx * msPerWord;
    const endTime = (idx + 1) * msPerWord;
    timings.push({
      word,
      startTime,
      endTime,
      characterIndex: charIndex
    });
    charIndex += word.length + 1; // +1 for space
  });

  return timings;
}

/**
 * Find the currently active word based on current playback time.
 */
export function getCurrentWordIndex(timings: WordTiming[], currentTimeMs: number): number {
  const idx = timings.findIndex(t => t.startTime <= currentTimeMs && currentTimeMs < t.endTime);
  return idx >= 0 ? idx : -1;
}

/**
 * Get the word that should be highlighted at the given playback time.
 */
export function getHighlightedWord(timings: WordTiming[], currentTimeMs: number): WordTiming | null {
  const idx = getCurrentWordIndex(timings, currentTimeMs);
  return idx >= 0 ? timings[idx] : null;
}
