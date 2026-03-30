/**
 * Linear interpolation between two values.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Calculate interpolated highlight position between two words
 * based on elapsed time since the last word boundary event.
 */
export function interpolateHighlight(
  currentX: number,
  currentY: number,
  currentWidth: number,
  nextX: number,
  nextY: number,
  nextWidth: number,
  elapsed: number,
  duration: number
): { x: number; y: number; width: number } {
  if (duration <= 0) {
    return { x: currentX, y: currentY, width: currentWidth };
  }

  const t = Math.max(0, Math.min(1, elapsed / duration));
  return {
    x: lerp(currentX, nextX, t),
    y: lerp(currentY, nextY, t),
    width: lerp(currentWidth, nextWidth, t),
  };
}
