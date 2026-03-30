import { describe, it, expect } from 'vitest';
import { lerp, interpolateHighlight } from '../src/utils/interpolation';

describe('lerp', () => {
  it('returns a at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns b at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('clamps t below 0', () => {
    expect(lerp(10, 20, -0.5)).toBe(10);
  });

  it('clamps t above 1', () => {
    expect(lerp(10, 20, 1.5)).toBe(20);
  });
});

describe('interpolateHighlight', () => {
  it('returns current position at elapsed=0', () => {
    const result = interpolateHighlight(0, 0, 50, 100, 0, 60, 0, 1);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(50);
  });

  it('returns next position at full duration', () => {
    const result = interpolateHighlight(0, 0, 50, 100, 24, 60, 1, 1);
    expect(result.x).toBe(100);
    expect(result.y).toBe(24);
    expect(result.width).toBe(60);
  });

  it('returns current position when duration is 0', () => {
    const result = interpolateHighlight(10, 20, 30, 100, 200, 300, 0.5, 0);
    expect(result.x).toBe(10);
    expect(result.y).toBe(20);
    expect(result.width).toBe(30);
  });
});
