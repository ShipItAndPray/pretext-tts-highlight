export interface Token {
  word: string;
  index: number;
  charStart: number;
  charEnd: number;
}

/**
 * Split text into word tokens, preserving character offsets.
 * Punctuation attached to words stays attached (e.g. "hello," is one token).
 * Whitespace is consumed between tokens but not included in any token.
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      word: match[0],
      index,
      charStart: match.index,
      charEnd: match.index + match[0].length,
    });
    index++;
  }

  return tokens;
}
