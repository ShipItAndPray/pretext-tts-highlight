import type { TTSProvider } from '../types';
import { tokenize } from '../utils/textTokenizer';

export interface WebSpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
}

/**
 * TTS provider using the Web Speech API (SpeechSynthesis).
 *
 * Maps `boundary` events (charIndex) to word indices using
 * the tokenizer's character offset data.
 */
export function createWebSpeechProvider(options?: WebSpeechOptions): TTSProvider {
  let utterance: SpeechSynthesisUtterance | null = null;
  let boundaryCallback: ((wordIndex: number, startTime: number) => void) | null = null;
  let endCallback: (() => void) | null = null;
  let rate = options?.rate ?? 1;
  let tokens: ReturnType<typeof tokenize> = [];
  let startTime = 0;

  function charIndexToWordIndex(charIndex: number): number {
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (charIndex >= tokens[i].charStart) {
        return i;
      }
    }
    return 0;
  }

  return {
    async speak(text: string): Promise<void> {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        throw new Error('Web Speech API not available');
      }

      tokens = tokenize(text);
      window.speechSynthesis.cancel();

      return new Promise<void>((resolve) => {
        utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        if (options?.voice) utterance.voice = options.voice;
        if (options?.pitch) utterance.pitch = options.pitch;

        startTime = performance.now() / 1000;

        utterance.onboundary = (event: SpeechSynthesisEvent) => {
          if (event.name === 'word') {
            const wordIndex = charIndexToWordIndex(event.charIndex);
            const elapsed = performance.now() / 1000 - startTime;
            boundaryCallback?.(wordIndex, elapsed);
          }
        };

        utterance.onend = () => {
          endCallback?.();
          resolve();
        };

        utterance.onerror = () => {
          endCallback?.();
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },

    pause(): void {
      window.speechSynthesis?.pause();
    },

    resume(): void {
      window.speechSynthesis?.resume();
    },

    stop(): void {
      window.speechSynthesis?.cancel();
    },

    onWordBoundary(callback: (wordIndex: number, startTime: number) => void): void {
      boundaryCallback = callback;
    },

    onEnd(callback: () => void): void {
      endCallback = callback;
    },

    setRate(newRate: number): void {
      rate = newRate;
      if (utterance) {
        utterance.rate = newRate;
      }
    },
  };
}
