import { PLAYBACK_SPEEDS } from '../../utils/constants';
import RecordButton from '../pronunciation/RecordButton';
import type { PracticeState } from '../../hooks/usePronunciationPractice';

interface Props {
  isPlaying: boolean;
  playbackRate: number;
  autoLoop: boolean;
  onTogglePlay: () => void;
  onSkipCaption: (dir: 1 | -1) => void;
  onToggleLoop: () => void;
  onSetSpeed: (rate: number) => void;
  onGrammarCoach: () => void;
  grammarLoading?: boolean;
  pronunciationState?: PracticeState;
  onMicStart?: () => void;
  onMicStop?: () => void;
}

export default function PlayerControls({
  isPlaying,
  playbackRate,
  autoLoop,
  onTogglePlay,
  onSkipCaption,
  onToggleLoop,
  onSetSpeed,
  onGrammarCoach,
  grammarLoading,
  pronunciationState = 'idle',
  onMicStart,
  onMicStop,
}: Props) {
  const nextSpeed = () => {
    const idx = PLAYBACK_SPEEDS.indexOf(playbackRate as typeof PLAYBACK_SPEEDS[number]);
    const next = (idx + 1) % PLAYBACK_SPEEDS.length;
    onSetSpeed(PLAYBACK_SPEEDS[next]);
  };

  const isSpeedModified = playbackRate !== 1;

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3">
      {/* Play/Pause */}
      <ControlButton onClick={onTogglePlay} active={isPlaying} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </ControlButton>

      {/* Skip Previous */}
      <ControlButton onClick={() => onSkipCaption(-1)} aria-label="Previous caption">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
        </svg>
      </ControlButton>

      {/* Skip Next */}
      <ControlButton onClick={() => onSkipCaption(1)} aria-label="Next caption">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11.555 5.168A1 1 0 0010 6v2.798L4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z" />
        </svg>
      </ControlButton>

      {/* Loop */}
      <ControlButton onClick={onToggleLoop} active={autoLoop} aria-label="Auto-loop">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </ControlButton>

      {/* Speed */}
      <button
        onClick={nextSpeed}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          isSpeedModified
            ? 'text-[--color-accent-text] hover:opacity-80'
            : 'text-[--color-text-muted] hover:bg-[--color-hover] hover:text-[--color-text-secondary]'
        }`}
        style={isSpeedModified ? {
          backgroundColor: 'var(--color-accent)',
          color: '#ffffff',
        } : undefined}
      >
        {playbackRate}x
      </button>

      {/* Pronunciation Practice */}
      {onMicStart && onMicStop && (
        <RecordButton
          state={pronunciationState}
          onStart={onMicStart}
          onStop={onMicStop}
          compact
        />
      )}

      {/* Grammar Coach */}
      <ControlButton onClick={onGrammarCoach} aria-label="Grammar Coach" active={grammarLoading}>
        {grammarLoading ? (
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </ControlButton>
    </div>
  );
}

function ControlButton({ children, active, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'text-[--color-accent-text] hover:opacity-80'
          : 'text-[--color-text-muted] hover:bg-[--color-hover] hover:text-[--color-text-secondary]'
      }`}
      style={active ? {
        backgroundColor: 'var(--color-accent)',
        color: '#ffffff',
      } : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
