import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/utils/textTokenizer';

describe('tokenize', () => {
  it('splits simple words', () => {
    const tokens = tokenize('Hello world');
    expect(tokens).toHaveLength(2);
    expect(tokens[0].word).toBe('Hello');
    expect(tokens[1].word).toBe('world');
  });

  it('preserves punctuation attached to words', () => {
    const tokens = tokenize('Hello, world!');
    expect(tokens[0].word).toBe('Hello,');
    expect(tokens[1].word).toBe('world!');
  });

  it('tracks character offsets', () => {
    const tokens = tokenize('one two three');
    expect(tokens[0].charStart).toBe(0);
    expect(tokens[0].charEnd).toBe(3);
    expect(tokens[1].charStart).toBe(4);
    expect(tokens[1].charEnd).toBe(7);
    expect(tokens[2].charStart).toBe(8);
    expect(tokens[2].charEnd).toBe(13);
  });

  it('handles multiple spaces', () => {
    const tokens = tokenize('hello    world');
    expect(tokens).toHaveLength(2);
    expect(tokens[1].charStart).toBe(9);
  });

  it('handles empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('handles single word', () => {
    const tokens = tokenize('solo');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].index).toBe(0);
  });

  it('assigns sequential indices', () => {
    const tokens = tokenize('a b c d e');
    tokens.forEach((t, i) => expect(t.index).toBe(i));
  });
});
