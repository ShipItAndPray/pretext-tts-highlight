import { useState, useEffect, useCallback, useRef } from 'react';
import type { FontConfig, WordPosition } from '../types';
import { calculateWordPositions, clearPositionCache } from '../core/wordPositions';

/**
 * React hook that calculates word positions and recalculates on resize.
 *
 * Attaches a ResizeObserver to the provided container ref.
 * When the container width changes, positions are recalculated
 * using the new maxWidth -- without interrupting audio playback.
 */
export function useWordPositions(
  text: string,
  font: FontConfig,
  maxWidth: number,
  containerRef?: React.RefObject<HTMLElement | null>
): {
  wordPositions: WordPosition[];
  recalculate: (newMaxWidth?: number) => void;
} {
  const [positions, setPositions] = useState<WordPosition[]>(() =>
    calculateWordPositions(text, font, maxWidth)
  );
  const currentMaxWidth = useRef(maxWidth);

  const recalculate = useCallback(
    (newMaxWidth?: number) => {
      const w = newMaxWidth ?? currentMaxWidth.current;
      currentMaxWidth.current = w;
      clearPositionCache();
      setPositions(calculateWordPositions(text, font, w));
    },
    [text, font]
  );

  // Recalculate when text, font, or maxWidth change
  useEffect(() => {
    currentMaxWidth.current = maxWidth;
    setPositions(calculateWordPositions(text, font, maxWidth));
  }, [text, font, maxWidth]);

  // ResizeObserver for container width changes
  useEffect(() => {
    const el = containerRef?.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        if (Math.abs(newWidth - currentMaxWidth.current) > 1) {
          currentMaxWidth.current = newWidth;
          clearPositionCache();
          setPositions(calculateWordPositions(text, font, newWidth));
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, text, font]);

  return { wordPositions: positions, recalculate };
}
