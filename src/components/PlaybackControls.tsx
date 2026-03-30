import React from 'react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRateChange: (rate: number) => void;
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background 150ms',
};

const activeButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#e3f2fd',
  borderColor: '#2196f3',
};

const rates = [0.5, 1, 1.5, 2];

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isPaused,
  progress,
  onPlay,
  onPause,
  onStop,
  onRateChange,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '16px',
        flexWrap: 'wrap',
      }}
    >
      {!isPlaying && !isPaused ? (
        <button style={buttonStyle} onClick={onPlay} aria-label="Play">
          Play
        </button>
      ) : (
        <button style={buttonStyle} onClick={onPause} aria-label={isPaused ? 'Resume' : 'Pause'}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      )}
      <button style={buttonStyle} onClick={onStop} aria-label="Stop" disabled={!isPlaying && !isPaused}>
        Stop
      </button>

      <span style={{ margin: '0 8px', fontSize: '13px', color: '#666' }}>Speed:</span>
      {rates.map((r) => (
        <button
          key={r}
          style={buttonStyle}
          onClick={() => onRateChange(r)}
          aria-label={`${r}x speed`}
        >
          {r}x
        </button>
      ))}

      <div
        style={{
          flex: 1,
          minWidth: '100px',
          height: '4px',
          background: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden',
          marginLeft: '8px',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, progress * 100)}%`,
            height: '100%',
            background: '#2196f3',
            borderRadius: '2px',
            transition: 'width 150ms ease',
          }}
        />
      </div>
    </div>
  );
};

PlaybackControls.displayName = 'PlaybackControls';
