import type { WordPosition, WordTimestamp, SyncedWord } from '../types';

/**
 * Merge word positions with word timestamps to produce SyncedWord objects.
 *
 * Timestamps are matched to positions by wordIndex. If a timestamp
 * references a wordIndex that doesn't exist in positions, it is skipped.
 * Positions without timestamps get startTime/endTime of -1.
 */
export function syncTimestamps(
  words: WordPosition[],
  timestamps: WordTimestamp[]
): SyncedWord[] {
  const tsMap = new Map<number, WordTimestamp>();
  for (const ts of timestamps) {
    tsMap.set(ts.wordIndex, ts);
  }

  return words.map((wp) => {
    const ts = tsMap.get(wp.index);
    return {
      ...wp,
      wordIndex: wp.index,
      startTime: ts?.startTime ?? -1,
      endTime: ts?.endTime ?? -1,
    };
  });
}

/**
 * Given a currentTime (seconds), find the word index that should be highlighted.
 * Returns -1 if no word matches.
 */
export function findWordAtTime(
  timestamps: WordTimestamp[],
  currentTime: number
): number {
  for (let i = timestamps.length - 1; i >= 0; i--) {
    if (currentTime >= timestamps[i].startTime) {
      return timestamps[i].wordIndex;
    }
  }
  return -1;
}
