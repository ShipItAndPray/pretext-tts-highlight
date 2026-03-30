import type { HighlightState, TTSProvider } from '../types';

export interface HighlightEngineCallbacks {
  onWordChange: (wordIndex: number) => void;
  onStateChange: (state: HighlightState) => void;
  onComplete: () => void;
}

/**
 * Core highlight state machine.
 *
 * States: IDLE -> PLAYING -> PAUSED -> PLAYING -> IDLE
 *         PLAYING -> SEEKING -> PLAYING
 *
 * The engine listens to a TTSProvider's word boundary events
 * and drives the currentWordIndex. Positions are managed externally
 * (by the hook/component) so resize can update them independently
 * without interrupting playback.
 */
export class HighlightEngine {
  private state: HighlightState = 'IDLE';
  private currentWordIndex = -1;
  private provider: TTSProvider | null = null;
  private callbacks: HighlightEngineCallbacks;
  private boundaryCleanup: (() => void) | null = null;
  private endCleanup: (() => void) | null = null;

  constructor(callbacks: HighlightEngineCallbacks) {
    this.callbacks = callbacks;
  }

  getState(): HighlightState {
    return this.state;
  }

  getCurrentWordIndex(): number {
    return this.currentWordIndex;
  }

  attach(provider: TTSProvider): void {
    this.detach();
    this.provider = provider;

    const onBoundary = (wordIndex: number, _startTime: number) => {
      this.currentWordIndex = wordIndex;
      this.callbacks.onWordChange(wordIndex);
    };

    const onEnd = () => {
      this.state = 'IDLE';
      this.currentWordIndex = -1;
      this.callbacks.onStateChange('IDLE');
      this.callbacks.onComplete();
    };

    provider.onWordBoundary(onBoundary);
    provider.onEnd(onEnd);

    // Store references so we can conceptually "detach" later.
    // Real cleanup depends on provider implementation; we reset our state.
    this.boundaryCleanup = () => {};
    this.endCleanup = () => {};
  }

  detach(): void {
    if (this.provider) {
      this.provider.stop();
    }
    this.provider = null;
    this.boundaryCleanup = null;
    this.endCleanup = null;
  }

  async play(text: string): Promise<void> {
    if (!this.provider) return;
    this.state = 'PLAYING';
    this.currentWordIndex = 0;
    this.callbacks.onStateChange('PLAYING');
    this.callbacks.onWordChange(0);
    await this.provider.speak(text);
  }

  pause(): void {
    if (!this.provider || this.state !== 'PLAYING') return;
    this.provider.pause();
    this.state = 'PAUSED';
    this.callbacks.onStateChange('PAUSED');
  }

  resume(): void {
    if (!this.provider || this.state !== 'PAUSED') return;
    this.provider.resume();
    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');
  }

  stop(): void {
    if (!this.provider) return;
    this.provider.stop();
    this.state = 'IDLE';
    this.currentWordIndex = -1;
    this.callbacks.onStateChange('IDLE');
  }

  seekToWord(index: number): void {
    this.currentWordIndex = index;
    this.callbacks.onWordChange(index);
  }

  setRate(rate: number): void {
    this.provider?.setRate(rate);
  }

  destroy(): void {
    this.detach();
    this.state = 'IDLE';
    this.currentWordIndex = -1;
  }
}
