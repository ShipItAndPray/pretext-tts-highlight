import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HighlightEngine } from '../src/core/highlightEngine';
import type { TTSProvider } from '../src/types';

function createMockProvider(): TTSProvider & {
  _fireBoundary: (wordIndex: number, time: number) => void;
  _fireEnd: () => void;
} {
  let boundaryCallback: ((wordIndex: number, startTime: number) => void) | null = null;
  let endCallback: (() => void) | null = null;

  return {
    speak: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    setRate: vi.fn(),
    onWordBoundary(cb) {
      boundaryCallback = cb;
    },
    onEnd(cb) {
      endCallback = cb;
    },
    _fireBoundary(wordIndex: number, time: number) {
      boundaryCallback?.(wordIndex, time);
    },
    _fireEnd() {
      endCallback?.();
    },
  };
}

describe('HighlightEngine', () => {
  let engine: HighlightEngine;
  let onWordChange: ReturnType<typeof vi.fn>;
  let onStateChange: ReturnType<typeof vi.fn>;
  let onComplete: ReturnType<typeof vi.fn>;
  let provider: ReturnType<typeof createMockProvider>;

  beforeEach(() => {
    onWordChange = vi.fn();
    onStateChange = vi.fn();
    onComplete = vi.fn();
    engine = new HighlightEngine({ onWordChange, onStateChange, onComplete });
    provider = createMockProvider();
    engine.attach(provider);
  });

  it('starts in IDLE state', () => {
    const fresh = new HighlightEngine({ onWordChange: vi.fn(), onStateChange: vi.fn(), onComplete: vi.fn() });
    expect(fresh.getState()).toBe('IDLE');
    expect(fresh.getCurrentWordIndex()).toBe(-1);
  });

  it('transitions to PLAYING on play', async () => {
    await engine.play('Hello world');
    expect(engine.getState()).toBe('PLAYING');
    expect(onStateChange).toHaveBeenCalledWith('PLAYING');
    expect(provider.speak).toHaveBeenCalledWith('Hello world');
  });

  it('updates word index on boundary event', async () => {
    await engine.play('Hello world');
    provider._fireBoundary(1, 0.3);
    expect(engine.getCurrentWordIndex()).toBe(1);
    expect(onWordChange).toHaveBeenCalledWith(1);
  });

  it('transitions to PAUSED on pause', async () => {
    await engine.play('test');
    engine.pause();
    expect(engine.getState()).toBe('PAUSED');
    expect(onStateChange).toHaveBeenCalledWith('PAUSED');
    expect(provider.pause).toHaveBeenCalled();
  });

  it('transitions back to PLAYING on resume', async () => {
    await engine.play('test');
    engine.pause();
    engine.resume();
    expect(engine.getState()).toBe('PLAYING');
    expect(provider.resume).toHaveBeenCalled();
  });

  it('transitions to IDLE on stop', async () => {
    await engine.play('test');
    engine.stop();
    expect(engine.getState()).toBe('IDLE');
    expect(engine.getCurrentWordIndex()).toBe(-1);
    expect(provider.stop).toHaveBeenCalled();
  });

  it('fires onComplete when provider ends', async () => {
    await engine.play('test');
    provider._fireEnd();
    expect(engine.getState()).toBe('IDLE');
    expect(onComplete).toHaveBeenCalled();
  });

  it('seekToWord updates current index', () => {
    engine.seekToWord(5);
    expect(engine.getCurrentWordIndex()).toBe(5);
    expect(onWordChange).toHaveBeenCalledWith(5);
  });

  it('setRate delegates to provider', () => {
    engine.setRate(1.5);
    expect(provider.setRate).toHaveBeenCalledWith(1.5);
  });

  it('does not pause when not playing', () => {
    engine.pause();
    expect(engine.getState()).toBe('IDLE');
    expect(provider.pause).not.toHaveBeenCalled();
  });

  it('does not resume when not paused', async () => {
    await engine.play('test');
    engine.resume(); // already playing, not paused
    // Should not call provider.resume since state is PLAYING not PAUSED
    expect(provider.resume).not.toHaveBeenCalled();
  });
});
