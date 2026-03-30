import { describe, it, expect } from 'vitest';
import { syncTimestamps, findWordAtTime } from '../src/core/timestampSync';
import type { WordPosition, WordTimestamp } from '../src/types';

function makeWord(index: number, word: string): WordPosition {
  return {
    word,
    index,
    charStart: 0,
    charEnd: word.length,
    x: index * 50,
    y: 0,
    width: 40,
    height: 24,
    line: 0,
  };
}

describe('syncTimestamps', () => {
  it('merges positions with timestamps by wordIndex', () => {
    const words: WordPosition[] = [
      makeWord(0, 'The'),
      makeWord(1, 'quick'),
      makeWord(2, 'fox'),
    ];
    const timestamps: WordTimestamp[] = [
      { wordIndex: 0, startTime: 0.0, endTime: 0.3 },
      { wordIndex: 1, startTime: 0.3, endTime: 0.7 },
      { wordIndex: 2, startTime: 0.7, endTime: 1.0 },
    ];

    const synced = syncTimestamps(words, timestamps);
    expect(synced).toHaveLength(3);
    expect(synced[0].word).toBe('The');
    expect(synced[0].startTime).toBe(0.0);
    expect(synced[0].endTime).toBe(0.3);
    expect(synced[1].startTime).toBe(0.3);
    expect(synced[2].startTime).toBe(0.7);
  });

  it('assigns -1 times to words without timestamps', () => {
    const words: WordPosition[] = [makeWord(0, 'Hello'), makeWord(1, 'world')];
    const timestamps: WordTimestamp[] = [
      { wordIndex: 0, startTime: 0.0, endTime: 0.5 },
    ];

    const synced = syncTimestamps(words, timestamps);
    expect(synced[1].startTime).toBe(-1);
    expect(synced[1].endTime).toBe(-1);
  });

  it('ignores timestamps for non-existent word indices', () => {
    const words: WordPosition[] = [makeWord(0, 'Solo')];
    const timestamps: WordTimestamp[] = [
      { wordIndex: 0, startTime: 0.0, endTime: 0.5 },
      { wordIndex: 5, startTime: 1.0, endTime: 1.5 }, // no word at index 5
    ];

    const synced = syncTimestamps(words, timestamps);
    expect(synced).toHaveLength(1);
    expect(synced[0].startTime).toBe(0.0);
  });

  it('handles empty arrays', () => {
    expect(syncTimestamps([], [])).toEqual([]);
  });
});

describe('findWordAtTime', () => {
  const timestamps: WordTimestamp[] = [
    { wordIndex: 0, startTime: 0.0, endTime: 0.3 },
    { wordIndex: 1, startTime: 0.3, endTime: 0.7 },
    { wordIndex: 2, startTime: 0.7, endTime: 1.0 },
    { wordIndex: 3, startTime: 1.0, endTime: 1.5 },
  ];

  it('returns first word at time 0', () => {
    expect(findWordAtTime(timestamps, 0)).toBe(0);
  });

  it('returns correct word at mid-word time', () => {
    expect(findWordAtTime(timestamps, 0.5)).toBe(1);
  });

  it('returns correct word at exact boundary', () => {
    expect(findWordAtTime(timestamps, 0.7)).toBe(2);
  });

  it('returns last word for time beyond end', () => {
    expect(findWordAtTime(timestamps, 5.0)).toBe(3);
  });

  it('returns -1 for negative time', () => {
    expect(findWordAtTime(timestamps, -1)).toBe(-1);
  });

  it('returns -1 for empty timestamps', () => {
    expect(findWordAtTime([], 0.5)).toBe(-1);
  });
});
