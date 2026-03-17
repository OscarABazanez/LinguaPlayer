import type { PracticeState } from '../../hooks/usePronunciationPractice';

interface Props {
  state: PracticeState;
  onStart: () => void;
  onStop: () => void;
  compact?: boolean;
}

export default function RecordButton({ state, onStart, onStop, compact = false }: Props) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'transcribing' || state === 'analyzing';

  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else if (state === 'idle' || state === 'done' || state === 'error') {
      onStart();
    }
  };

  if (compact) {
    // Compact version for PlayerControls
    return (
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`
          relative p-2 rounded-xl transition-all duration-200
          ${isRecording
            ? 'text-[--color-error-text] bg-red-500/20'
            : isProcessing
              ? 'text-[--color-text-faint] opacity-50 cursor-not-allowed'
              : 'text-[--color-text-faint] hover:text-[--color-accent-text] hover:bg-[--color-hover]'
          }
        `}
        aria-label={isRecording ? 'Stop recording' : 'Practice pronunciation'}
        title={isRecording ? 'Stop recording' : 'Practice pronunciation'}
      >
        {/* Pulsing ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping opacity-30" />
        )}

        {isProcessing ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
        ) : isRecording ? (
          // Stop icon (square)
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="4" width="12" height="12" rx="2" />
          </svg>
        ) : (
          // Microphone icon
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    );
  }

  // Full-size version for PronunciationPanel
  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`
        relative flex items-center justify-center gap-2 px-6 py-3 rounded-2xl
        font-semibold transition-all duration-200
        ${isRecording
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600'
          : isProcessing
            ? 'bg-[--color-hover] text-[--color-text-faint] cursor-not-allowed'
            : 'bg-[--color-accent] text-white hover:opacity-90 shadow-lg shadow-[--color-accent]/30'
        }
      `}
    >
      {/* Pulsing ring */}
      {isRecording && (
        <span className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-20" />
      )}

      {isProcessing ? (
        <>
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </svg>
          <span>{state === 'transcribing' ? 'Transcribing...' : 'Analyzing...'}</span>
        </>
      ) : isRecording ? (
        <>
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="4" width="12" height="12" rx="2" />
          </svg>
          <span>Stop Recording</span>
          {/* Recording indicator dot */}
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          <span>Record</span>
        </>
      )}
    </button>
  );
}
