import React from 'react';
import type { HighlightStyle } from '../types';

interface HighlightedWordProps {
  word: string;
  isActive: boolean;
  highlightColor: string;
  highlightStyle: HighlightStyle;
  onClick?: () => void;
}

function getActiveStyles(
  color: string,
  style: HighlightStyle
): React.CSSProperties {
  switch (style) {
    case 'background':
      return { backgroundColor: color, borderRadius: '3px', padding: '0 2px' };
    case 'underline':
      return { textDecoration: 'underline', textDecorationColor: color, textUnderlineOffset: '3px', textDecorationThickness: '3px' };
    case 'bold':
      return { fontWeight: 700, color };
    case 'scale':
      return { transform: 'scale(1.05)', display: 'inline-block', color };
    default:
      return { backgroundColor: color };
  }
}

export const HighlightedWord: React.FC<HighlightedWordProps> = React.memo(
  ({ word, isActive, highlightColor, highlightStyle, onClick }) => {
    const style: React.CSSProperties = {
      display: 'inline',
      transition: 'all 150ms ease',
      cursor: onClick ? 'pointer' : undefined,
      ...(isActive ? getActiveStyles(highlightColor, highlightStyle) : {}),
    };

    return (
      <span style={style} onClick={onClick} data-highlighted={isActive || undefined}>
        {word}
      </span>
    );
  }
);

HighlightedWord.displayName = 'HighlightedWord';
