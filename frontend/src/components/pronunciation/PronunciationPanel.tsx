import type { ReactNode } from 'react';
import type { PracticeState } from '../../hooks/usePronunciationPractice';
import type { PronunciationResult } from '../../types/pronunciation';
import RecordButton from './RecordButton';
import ScoreDisplay from './ScoreDisplay';
import WordFeedback from './WordFeedback';

/**
 * Render simple markdown: **bold**, /respelling/, and line breaks.
 */
function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Split line into segments: bold (**...**), respelling (/.../) and plain text
    const parts: ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*)|(\/([\w\s'-]+(?:-[\w\s'-]+)*)\/)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      // Add plain text before this match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }

      if (match[1]) {
        // Bold: **text**
        parts.push(
          <strong key={`${lineIdx}-b-${match.index}`} className="text-[--color-text-primary] font-bold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Respelling: /TEXT/
        parts.push(
          <span key={`${lineIdx}-r-${match.index}`} className="text-[--color-accent-text] font-mono font-semibold">
            {match[3]}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Remaining plain text
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return (
      <span key={lineIdx}>
        {parts.length > 0 ? parts : line}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
}

interface Props {
  segmentText: string | null;
  state: PracticeState;
  result: PronunciationResult | null;
  error: string | null;
  pronunciationTips: string;
  tipsLoading: boolean;
  audioUrl: string | null;
  onStart: () => void;
  onStop: () => void;
  onSubmit: () => void;
  onReset: () => void;
  onRequestTips: () => void;
}

export default function PronunciationPanel({
  segmentText,
  state,
  result,
  error,
  pronunciationTips,
  tipsLoading,
  audioUrl,
  onStart,
  onStop,
  onSubmit,
  onReset,
  onRequestTips,
}: Props) {
  if (!segmentText) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <svg className="w-12 h-12 text-[--color-text-faint] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
        <p className="text-[--color-text-faint] text-sm">
          Play a video and navigate to a subtitle to practice pronunciation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Original sentence */}
      <div>
        <p className="text-[10px] text-[--color-text-faint] uppercase tracking-widest font-semibold mb-1.5">
          Sentence to practice
        </p>
        <p className="text-[--color-text-primary] font-medium text-base leading-relaxed">
          {segmentText}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[--color-border]" />

      {/* Record section */}
      {(state === 'idle' || state === 'recording') && (
        <div className="flex flex-col items-center gap-3 py-4">
          {state === 'idle' && (
            <p className="text-sm text-[--color-text-muted] text-center">
              Press record and say the sentence above
            </p>
          )}
          {state === 'recording' && (
            <p className="text-sm text-red-500 font-medium text-center animate-pulse">
              Listening... Click stop when done
            </p>
          )}
          <RecordButton state={state} onStart={onStart} onStop={onStop} />
        </div>
      )}

      {/* Review: listen back and decide */}
      {state === 'review' && audioUrl && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-[--color-text-muted] text-center">
            Listen to your recording before submitting
          </p>

          {/* Audio player */}
          <audio
            src={audioUrl}
            controls
            className="w-full max-w-[280px] h-10"
            style={{ filter: 'invert(0.85) hue-rotate(180deg)' }}
          />

          {/* Action buttons */}
          <div className="flex gap-3 w-full max-w-[280px]">
            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                bg-[--color-hover] text-[--color-text-secondary]
                hover:bg-[--color-border] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              Re-record
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                bg-[--color-accent] text-white
                hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Processing states */}
      {(state === 'transcribing' || state === 'analyzing') && (
        <div className="flex flex-col items-center gap-3 py-4">
          <span className="w-8 h-8 border-3 border-[--color-accent] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[--color-text-muted] text-center">
            {state === 'transcribing' ? 'Transcribing your speech...' : 'Analyzing pronunciation...'}
          </p>
        </div>
      )}

      {/* Error */}
      {state === 'error' && error && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex items-center gap-2 text-[--color-error-text]">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
          <RecordButton state={state} onStart={onStart} onStop={onStop} />
        </div>
      )}

      {/* Results */}
      {state === 'done' && result && (
        <div className="flex flex-col gap-4">
          {/* Score */}
          <div className="flex justify-center">
            <ScoreDisplay score={result.overallScore} />
          </div>

          {/* What you said */}
          <div>
            <p className="text-[10px] text-[--color-text-faint] uppercase tracking-widest font-semibold mb-1.5">
              What you said
            </p>
            <p className="text-sm text-[--color-text-secondary] italic">
              &ldquo;{result.spokenText}&rdquo;
            </p>
          </div>

          {/* Word-by-word feedback */}
          <div>
            <p className="text-[10px] text-[--color-text-faint] uppercase tracking-widest font-semibold mb-2">
              Word analysis
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.wordComparisons.map((comp, i) => (
                <WordFeedback key={i} comparison={comp} />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-[10px] text-[--color-text-faint]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Close
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Wrong
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400" /> Missing
            </span>
          </div>

          {/* Pronunciation tips from LLM (auto-shown for problem words) */}
          {(pronunciationTips || tipsLoading) && (
            <div>
              <div className="h-px bg-[--color-border] mb-4" />
              <p className="text-[10px] text-[--color-text-faint] uppercase tracking-widest font-semibold mb-2">
                How to pronounce
              </p>
              <div
                className="text-sm text-[--color-text-secondary] leading-relaxed rounded-xl p-3"
                style={{ backgroundColor: 'var(--color-hover)' }}
              >
                {pronunciationTips ? (
                  <div className="space-y-2">{renderMarkdown(pronunciationTips)}</div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[--color-accent] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[--color-text-faint]">Generating pronunciation guide...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-[--color-border]" />

          {/* Try Again button */}
          <button
            onClick={onReset}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium
              bg-[--color-accent] text-white
              hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
