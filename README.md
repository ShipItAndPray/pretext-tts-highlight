# @shipitandpray/pretext-tts-highlight

Karaoke-style word highlighting for text-to-speech. No DOM measurement. Smooth on resize.

## Install

```bash
npm install @shipitandpray/pretext-tts-highlight @pretext/core
```

## Quick Start

```tsx
import { SpeechHighlight } from '@shipitandpray/pretext-tts-highlight';

function ReadAloud() {
  return (
    <SpeechHighlight
      text="The quick brown fox jumps over the lazy dog."
      highlightColor="#ffeb3b"
      showControls
    />
  );
}
```

## How It Works

1. Text is tokenized into words with character offsets
2. Word bounding boxes are calculated using Pretext's layout engine -- no DOM measurement, no reflow
3. A TTS provider speaks the text and emits word boundary events
4. The highlight engine syncs visual highlighting to audio timestamps in real time
5. On resize, positions recalculate independently of audio -- no stutter, no interruption

## Providers

### Web Speech API (built-in, zero config)

```tsx
import { SpeechHighlight, createWebSpeechProvider } from '@shipitandpray/pretext-tts-highlight';

const provider = createWebSpeechProvider({ rate: 1.2 });

<SpeechHighlight text="Hello world" provider={provider} showControls />
```

The Web Speech API is available in all modern browsers. No API keys needed. The provider maps `SpeechSynthesisUtterance.boundary` events to word indices automatically.

### ElevenLabs (or any service with word timestamps)

```tsx
import { createGenericProvider } from '@shipitandpray/pretext-tts-highlight';

// After calling ElevenLabs API with alignment response format:
const audio = new Audio(audioUrl);
const timestamps = [
  { wordIndex: 0, startTime: 0.0, endTime: 0.3 },
  { wordIndex: 1, startTime: 0.3, endTime: 0.7 },
  // ... from ElevenLabs alignment data
];

const provider = createGenericProvider(audio, timestamps);

<SpeechHighlight text={articleText} provider={provider} highlightStyle="underline" />
```

The generic provider works with any TTS service that returns word-level timestamps: ElevenLabs, Google Cloud TTS, AWS Polly, Azure TTS, etc. It uses `requestAnimationFrame` to poll `audioElement.currentTime` for sub-frame sync accuracy.

### Custom Provider

Implement the `TTSProvider` interface:

```typescript
import type { TTSProvider } from '@shipitandpray/pretext-tts-highlight';

const myProvider: TTSProvider = {
  async speak(text) { /* start audio */ },
  pause() { /* pause */ },
  resume() { /* resume */ },
  stop() { /* stop */ },
  onWordBoundary(cb) { /* call cb(wordIndex, startTime) on each word */ },
  onEnd(cb) { /* call cb() when done */ },
  setRate(rate) { /* adjust speed */ },
};
```

## Hook API

For custom UIs, use the hook directly:

```tsx
import { useSpeechHighlight } from '@shipitandpray/pretext-tts-highlight';

function CustomHighlighter({ text }) {
  const {
    play, pause, stop, seekToWord, setRate,
    isPlaying, isPaused, currentWordIndex, progress, wordPositions,
  } = useSpeechHighlight(
    text,
    { fontFamily: 'Georgia', fontSize: 18, lineHeight: 28 },
    600
  );

  return (
    <div>
      {wordPositions.map((wp, i) => (
        <span
          key={i}
          onClick={() => seekToWord(i)}
          style={{ background: i === currentWordIndex ? '#ffeb3b' : 'none' }}
        >
          {wp.word}{' '}
        </span>
      ))}
      <button onClick={play}>Play</button>
    </div>
  );
}
```

## Highlight Styles

| Style | Description |
|-------|-------------|
| `background` | Yellow (or custom color) background behind the active word |
| `underline` | Thick colored underline beneath the active word |
| `bold` | Bold weight + color on the active word |
| `scale` | Slight 1.05x zoom on the active word |

## Comparison

| Feature | pretext-tts-highlight | Custom implementation | Speechify SDK |
|---------|----------------------|----------------------|---------------|
| Open source | Yes | N/A | No |
| Pre-render positions | Yes | No (DOM measurement) | Unknown |
| Smooth on resize | Yes | Stutters | Unknown |
| Multiple TTS providers | Yes (3+) | Manual | Proprietary |
| Bundle size | ~12KB gzipped | Custom | Unknown |

## Use Cases

- EdTech platforms (read-along, language learning)
- Accessibility tools (screen reader visual sync)
- E-readers and audiobook apps
- Language learning (word-level pronunciation tracking)
- Presentation tools (teleprompter with audio sync)

## API Reference

### `calculateWordPositions(text, font, maxWidth)`

Calculate word bounding boxes without the DOM.

### `syncTimestamps(words, timestamps)`

Merge word positions with timing data from any TTS provider.

### `findWordAtTime(timestamps, currentTime)`

Binary search for the active word at a given playback time.

### `createWebSpeechProvider(options?)`

Create a TTS provider using the Web Speech API.

### `createGenericProvider(audioElement, timestamps)`

Create a TTS provider from any audio element + word timestamps.

### `useSpeechHighlight(text, font, maxWidth, provider?)`

React hook returning playback state and controls.

### `useWordPositions(text, font, maxWidth, containerRef?)`

React hook for word positions with automatic resize recalculation.

### `<SpeechHighlight />`

Full-featured React component with built-in controls.

## Development

```bash
npm install
npm test          # Run vitest
npm run build     # Build ESM + CJS via tsup
```

## License

MIT
