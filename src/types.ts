/** Bounding box and metadata for a single word in the text layout. */
export interface WordPosition {
  word: string;
  index: number;
  charStart: number;
  charEnd: number;
  x: number;
  y: number;
  width: number;
  height: number;
  line: number;
}

/** Timing data for a single word from the TTS provider. */
export interface WordTimestamp {
  wordIndex: number;
  startTime: number;
  endTime: number;
}

/** A word with both position and timing data merged. */
export interface SyncedWord extends WordPosition, WordTimestamp {}

/** Font configuration for Pretext layout calculation. */
export interface FontConfig {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight?: number | string;
  letterSpacing?: number;
}

/** Unified interface for any TTS provider. */
export interface TTSProvider {
  speak(text: string): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  onWordBoundary(callback: (wordIndex: number, startTime: number) => void): void;
  onEnd(callback: () => void): void;
  setRate(rate: number): void;
}

/** Highlight visual style. */
export type HighlightStyle = 'background' | 'underline' | 'bold' | 'scale';

/** State machine states for the highlight engine. */
export type HighlightState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'SEEKING';

/** Props for the SpeechHighlight React component. */
export interface SpeechHighlightProps {
  text: string;
  font?: FontConfig;
  highlightColor?: string;
  highlightStyle?: HighlightStyle;
  provider?: TTSProvider;
  autoPlay?: boolean;
  showControls?: boolean;
  onWordChange?: (word: string, index: number) => void;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Full state returned by the useSpeechHighlight hook. */
export interface SpeechHighlightState {
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  progress: number;
  wordPositions: WordPosition[];
}
