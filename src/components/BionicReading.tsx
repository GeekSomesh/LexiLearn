import { useEffect, useState, useRef } from 'react';
import { estimateWordTimings, getHighlightedWord, WordTiming } from '../services/wordTimingService';

interface BionicReadingProps {
  text: string;
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
  className?: string;
}

/**
 * BionicReading component displays text with word-by-word highlighting synchronized to audio playback.
 * Uses text-vide-like styling with bold first letters and word highlighting on playback.
 */
export const BionicReading = ({
  text,
  isPlaying,
  audioElement,
  className = ''
}: BionicReadingProps) => {
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize word timings when audio metadata loads
  useEffect(() => {
    if (!audioElement || !isPlaying) return;

    const updateTimings = () => {
      if (audioElement.duration && !isNaN(audioElement.duration)) {
        const timings = estimateWordTimings(text, audioElement.duration * 1000);
        setWordTimings(timings);
      }
    };

    // Try to get duration immediately
    if (audioElement.duration && !isNaN(audioElement.duration)) {
      updateTimings();
    } else {
      // Wait for metadata to load
      audioElement.addEventListener('loadedmetadata', updateTimings);
      return () => audioElement.removeEventListener('loadedmetadata', updateTimings);
    }
  }, [audioElement, isPlaying, text]);

  // Sync current word highlight to audio playback
  useEffect(() => {
    if (!isPlaying || !audioElement || wordTimings.length === 0) {
      setCurrentWordIndex(-1);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updateCurrentWord = () => {
      const currentTimeMs = audioElement.currentTime * 1000;
      const highlighted = getHighlightedWord(wordTimings, currentTimeMs);
      if (highlighted) {
        const idx = wordTimings.indexOf(highlighted);
        setCurrentWordIndex(idx);
      } else {
        setCurrentWordIndex(-1);
      }
      animationFrameRef.current = requestAnimationFrame(updateCurrentWord);
    };

    animationFrameRef.current = requestAnimationFrame(updateCurrentWord);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audioElement, wordTimings]);

  const words = text.split(/\s+/).filter(w => w.length > 0);

  return (
    <div className={`bionic-reading ${className}`}>
      {words.map((word, idx) => {
        const isHighlighted = idx === currentWordIndex;
        const firstChar = word.charAt(0);
        const restChars = word.slice(1);

        return (
          <span
            key={idx}
            className={`inline-block mr-1 transition-all duration-100 ${
              isHighlighted
                ? 'bg-yellow-300 px-1 py-0.5 rounded font-bold scale-105'
                : ''
            }`}
          >
            <span className="font-bold">{firstChar}</span>
            {restChars}
          </span>
        );
      })}
    </div>
  );
};
