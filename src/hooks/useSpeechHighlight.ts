import { useState, useCallback, useRef, useEffect } from 'react';
import type { FontConfig, TTSProvider, SpeechHighlightState } from '../types';
import { HighlightEngine } from '../core/highlightEngine';
import { calculateWordPositions } from '../core/wordPositions';

/**
 * Main React hook for speech-synchronized word highlighting.
 *
 * Manages the highlight engine, word positions, and playback state.
 * Positions recalculate independently of audio state, so resizing
 * the container causes smooth repositioning with no stutter.
 */
export function useSpeechHighlight(
  text: string,
  font: FontConfig,
  maxWidth: number,
  provider?: TTSProvider
): SpeechHighlightState & {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekToWord: (index: number) => void;
  setRate: (rate: number) => void;
} {
  const [state, setState] = useState<SpeechHighlightState>({
    isPlaying: false,
    isPaused: false,
    currentWordIndex: -1,
    progress: 0,
    wordPositions: calculateWordPositions(text, font, maxWidth),
  });

  const engineRef = useRef<HighlightEngine | null>(null);
  const totalWords = useRef(0);

  // Initialize engine
  useEffect(() => {
    const engine = new HighlightEngine({
      onWordChange(wordIndex: number) {
        setState((prev) => ({
          ...prev,
          currentWordIndex: wordIndex,
          progress: totalWords.current > 0 ? wordIndex / totalWords.current : 0,
        }));
      },
      onStateChange(engineState) {
        setState((prev) => ({
          ...prev,
          isPlaying: engineState === 'PLAYING',
          isPaused: engineState === 'PAUSED',
        }));
      },
      onComplete() {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentWordIndex: -1,
          progress: 1,
        }));
      },
    });

    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  // Attach provider
  useEffect(() => {
    if (provider && engineRef.current) {
      engineRef.current.attach(provider);
    }
  }, [provider]);

  // Recalculate positions when layout params change
  useEffect(() => {
    const positions = calculateWordPositions(text, font, maxWidth);
    totalWords.current = positions.length;
    setState((prev) => ({ ...prev, wordPositions: positions }));
  }, [text, font, maxWidth]);

  const play = useCallback(() => {
    engineRef.current?.play(text);
  }, [text]);

  const pause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.getState() === 'PAUSED') {
      engine.resume();
    } else {
      engine.pause();
    }
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  const seekToWord = useCallback((index: number) => {
    engineRef.current?.seekToWord(index);
  }, []);

  const setRate = useCallback((rate: number) => {
    engineRef.current?.setRate(rate);
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    seekToWord,
    setRate,
  };
}
