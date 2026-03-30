import React, { useRef, useEffect } from 'react';
import type { SpeechHighlightProps, FontConfig } from '../types';
import { useSpeechHighlight } from '../hooks/useSpeechHighlight';
import { HighlightedWord } from './HighlightedWord';
import { PlaybackControls } from './PlaybackControls';

const DEFAULT_FONT: FontConfig = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 18,
  lineHeight: 28,
};

/**
 * Main SpeechHighlight React component.
 *
 * Renders text as a series of <span> elements, one per word.
 * The active word receives a highlight style. Uses ResizeObserver
 * internally to recalculate positions on resize without interrupting
 * audio playback.
 */
export const SpeechHighlight: React.FC<SpeechHighlightProps> = ({
  text,
  font = DEFAULT_FONT,
  highlightColor = '#ffeb3b',
  highlightStyle = 'background',
  provider,
  autoPlay = false,
  showControls = false,
  onWordChange,
  onComplete,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const maxWidthRef = useRef(600);

  const {
    isPlaying,
    isPaused,
    currentWordIndex,
    progress,
    wordPositions,
    play,
    pause,
    stop,
    seekToWord,
    setRate,
  } = useSpeechHighlight(text, font, maxWidthRef.current, provider);

  // Notify parent on word change
  useEffect(() => {
    if (currentWordIndex >= 0 && currentWordIndex < wordPositions.length) {
      onWordChange?.(wordPositions[currentWordIndex].word, currentWordIndex);
    }
  }, [currentWordIndex, wordPositions, onWordChange]);

  // Notify parent on complete
  useEffect(() => {
    if (progress >= 1 && !isPlaying) {
      onComplete?.();
    }
  }, [progress, isPlaying, onComplete]);

  // Auto-play if requested
  useEffect(() => {
    if (autoPlay && provider) {
      play();
    }
  }, [autoPlay, provider, play]);

  // Render words with spaces between them
  const words = wordPositions.map((wp, i) => (
    <React.Fragment key={i}>
      <HighlightedWord
        word={wp.word}
        isActive={i === currentWordIndex}
        highlightColor={highlightColor}
        highlightStyle={highlightStyle}
        onClick={() => seekToWord(i)}
      />
      {i < wordPositions.length - 1 ? ' ' : ''}
    </React.Fragment>
  ));

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        fontFamily: font.fontFamily,
        fontSize: `${font.fontSize}px`,
        lineHeight: `${font.lineHeight}px`,
        ...style,
      }}
    >
      <div style={{ userSelect: 'text' }}>{words}</div>
      {showControls && (
        <PlaybackControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          progress={progress}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onRateChange={setRate}
        />
      )}
    </div>
  );
};

SpeechHighlight.displayName = 'SpeechHighlight';
