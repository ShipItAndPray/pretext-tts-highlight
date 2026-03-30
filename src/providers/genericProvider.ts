import type { TTSProvider, WordTimestamp } from '../types';
import { findWordAtTime } from '../core/timestampSync';

/**
 * Generic TTS provider that works with any HTMLAudioElement + word timestamps.
 *
 * Uses requestAnimationFrame to poll audioElement.currentTime and fire
 * word boundary events when the current time crosses a word boundary.
 *
 * Works with any TTS service that provides word-level timestamps:
 * Google Cloud TTS, AWS Polly, Azure TTS, ElevenLabs, etc.
 */
export function createGenericProvider(
  audioElement: HTMLAudioElement,
  timestamps: WordTimestamp[]
): TTSProvider {
  let boundaryCallback: ((wordIndex: number, startTime: number) => void) | null = null;
  let endCallback: (() => void) | null = null;
  let rafId: number | null = null;
  let lastWordIndex = -1;
  let rate = 1;

  function pollLoop(): void {
    if (audioElement.paused || audioElement.ended) {
      rafId = null;
      return;
    }

    const currentTime = audioElement.currentTime;
    const wordIndex = findWordAtTime(timestamps, currentTime);

    if (wordIndex !== lastWordIndex && wordIndex >= 0) {
      lastWordIndex = wordIndex;
      boundaryCallback?.(wordIndex, currentTime);
    }

    rafId = requestAnimationFrame(pollLoop);
  }

  function startPolling(): void {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(pollLoop);
  }

  function stopPolling(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Listen for audio end
  audioElement.addEventListener('ended', () => {
    stopPolling();
    endCallback?.();
  });

  return {
    async speak(_text: string): Promise<void> {
      lastWordIndex = -1;
      audioElement.playbackRate = rate;
      audioElement.currentTime = 0;
      await audioElement.play();
      startPolling();
    },

    pause(): void {
      audioElement.pause();
      stopPolling();
    },

    resume(): void {
      audioElement.play();
      startPolling();
    },

    stop(): void {
      audioElement.pause();
      audioElement.currentTime = 0;
      stopPolling();
      lastWordIndex = -1;
    },

    onWordBoundary(callback: (wordIndex: number, startTime: number) => void): void {
      boundaryCallback = callback;
    },

    onEnd(callback: () => void): void {
      endCallback = callback;
    },

    setRate(newRate: number): void {
      rate = newRate;
      audioElement.playbackRate = newRate;
    },
  };
}
