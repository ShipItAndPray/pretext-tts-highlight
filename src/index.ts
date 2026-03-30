// Types
export type {
  WordPosition,
  WordTimestamp,
  SyncedWord,
  FontConfig,
  TTSProvider,
  HighlightStyle,
  HighlightState,
  SpeechHighlightProps,
  SpeechHighlightState,
} from './types';

// Core
export { calculateWordPositions, clearPositionCache } from './core/wordPositions';
export { syncTimestamps, findWordAtTime } from './core/timestampSync';
export { HighlightEngine } from './core/highlightEngine';

// Providers
export { createWebSpeechProvider } from './providers/webSpeechProvider';
export { createGenericProvider } from './providers/genericProvider';

// Hooks
export { useWordPositions } from './hooks/useWordPositions';
export { useSpeechHighlight } from './hooks/useSpeechHighlight';

// Components
export { SpeechHighlight } from './components/SpeechHighlight';
export { HighlightedWord } from './components/HighlightedWord';
export { PlaybackControls } from './components/PlaybackControls';

// Utils
export { tokenize } from './utils/textTokenizer';
export { lerp, interpolateHighlight } from './utils/interpolation';
