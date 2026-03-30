import { describe, it, expect, beforeEach } from 'vitest';
import { calculateWordPositions, clearPositionCache } from '../src/core/wordPositions';
import type { FontConfig } from '../src/types';

const font: FontConfig = {
  fontFamily: 'Arial',
  fontSize: 16,
  lineHeight: 24,
};

describe('calculateWordPositions', () => {
  beforeEach(() => {
    clearPositionCache();
  });

  it('returns correct number of word positions', () => {
    const positions = calculateWordPositions('The quick brown fox', font, 600);
    expect(positions).toHaveLength(4);
  });

  it('assigns correct word text', () => {
    const positions = calculateWordPositions('Hello world', font, 600);
    expect(positions[0].word).toBe('Hello');
    expect(positions[1].word).toBe('world');
  });

  it('assigns sequential indices', () => {
    const positions = calculateWordPositions('one two three four', font, 600);
    positions.forEach((p, i) => {
      expect(p.index).toBe(i);
    });
  });

  it('tracks character offsets correctly', () => {
    const text = 'Hello world';
    const positions = calculateWordPositions(text, font, 600);
    expect(positions[0].charStart).toBe(0);
    expect(positions[0].charEnd).toBe(5);
    expect(positions[1].charStart).toBe(6);
    expect(positions[1].charEnd).toBe(11);
  });

  it('wraps words to next line when exceeding maxWidth', () => {
    // Each char is 16 * 0.6 = 9.6px wide. "Hello" = 48px.
    // With maxWidth = 60, "Hello" (48px) fits but adding space + "world" won't.
    const positions = calculateWordPositions('Hello world', font, 60);
    expect(positions[0].line).toBe(0);
    expect(positions[1].line).toBe(1);
    expect(positions[1].x).toBe(0); // reset to start of line
  });

  it('keeps words on same line when they fit', () => {
    const positions = calculateWordPositions('Hi there', font, 600);
    expect(positions[0].line).toBe(0);
    expect(positions[1].line).toBe(0);
    expect(positions[1].x).toBeGreaterThan(0);
  });

  it('calculates positive width and height for all words', () => {
    const positions = calculateWordPositions('Test text here', font, 600);
    positions.forEach((p) => {
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBe(24); // lineHeight
    });
  });

  it('handles single word', () => {
    const positions = calculateWordPositions('Hello', font, 600);
    expect(positions).toHaveLength(1);
    expect(positions[0].x).toBe(0);
    expect(positions[0].y).toBe(0);
  });

  it('handles empty string', () => {
    const positions = calculateWordPositions('', font, 600);
    expect(positions).toHaveLength(0);
  });

  it('handles punctuation attached to words', () => {
    const positions = calculateWordPositions('Hello, world!', font, 600);
    expect(positions[0].word).toBe('Hello,');
    expect(positions[1].word).toBe('world!');
  });

  it('caches results for identical inputs', () => {
    const a = calculateWordPositions('cached text', font, 600);
    const b = calculateWordPositions('cached text', font, 600);
    expect(a).toBe(b); // same reference = cached
  });

  it('returns different results after cache clear', () => {
    const a = calculateWordPositions('cached text', font, 600);
    clearPositionCache();
    const b = calculateWordPositions('cached text', font, 600);
    expect(a).not.toBe(b); // different reference
    expect(a).toEqual(b); // same content
  });

  it('uses letterSpacing when provided', () => {
    const fontWithSpacing: FontConfig = { ...font, letterSpacing: 2 };
    const normal = calculateWordPositions('Hello', font, 600);
    const spaced = calculateWordPositions('Hello', fontWithSpacing, 600);
    expect(spaced[0].width).toBeGreaterThan(normal[0].width);
  });
});
