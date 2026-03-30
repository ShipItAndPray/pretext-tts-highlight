import type { FontConfig, WordPosition } from '../types';
import { tokenize } from '../utils/textTokenizer';

/**
 * Cache for word position calculations.
 * Key: hash of text + font + maxWidth.
 */
const cache = new Map<string, WordPosition[]>();

function makeCacheKey(text: string, font: FontConfig, maxWidth: number): string {
  return `${text}|${font.fontFamily}|${font.fontSize}|${font.lineHeight}|${font.fontWeight ?? 400}|${font.letterSpacing ?? 0}|${maxWidth}`;
}

/**
 * Calculate word positions using character-level measurements.
 *
 * This function computes where each word sits in a text layout
 * without touching the DOM. It uses a simple text-measurement model
 * based on the font config: each character is approximated at
 * fontSize * 0.6 width (monospace-like estimation), with line wrapping
 * at maxWidth.
 *
 * In production, this would delegate to @pretext/core's layoutText()
 * for precise per-character positions. The interface is designed to
 * be a drop-in replacement once Pretext is wired up.
 */
export function calculateWordPositions(
  text: string,
  font: FontConfig,
  maxWidth: number
): WordPosition[] {
  const key = makeCacheKey(text, font, maxWidth);
  const cached = cache.get(key);
  if (cached) return cached;

  const tokens = tokenize(text);
  const charWidth = font.fontSize * 0.6 + (font.letterSpacing ?? 0);
  const spaceWidth = charWidth;
  const lineHeight = font.lineHeight;

  const positions: WordPosition[] = [];
  let cursorX = 0;
  let line = 0;

  for (const token of tokens) {
    const wordWidth = token.word.length * charWidth;

    // Wrap to next line if word exceeds maxWidth (but allow first word on line)
    if (cursorX > 0 && cursorX + wordWidth > maxWidth) {
      line++;
      cursorX = 0;
    }

    positions.push({
      word: token.word,
      index: token.index,
      charStart: token.charStart,
      charEnd: token.charEnd,
      x: cursorX,
      y: line * lineHeight,
      width: wordWidth,
      height: lineHeight,
      line,
    });

    cursorX += wordWidth + spaceWidth;
  }

  cache.set(key, positions);
  return positions;
}

/** Clear the position cache (useful on font/size change). */
export function clearPositionCache(): void {
  cache.clear();
}
