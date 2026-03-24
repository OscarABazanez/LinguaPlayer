import type { Segment } from '../../types/subtitle';
import type { SegmentDifficulty, DifficultyLevel } from '../../types/exercise';
import type { PracticeState } from '../../hooks/usePronunciationPractice';
import type { PronunciationResult } from '../../types/pronunciation';
import PronunciationPanel from '../pronunciation/PronunciationPanel';

interface Props {
  segment: Segment;
  difficulty: SegmentDifficulty;
  pronunciationState: PracticeState;
  pronunciationResult: PronunciationResult | null;
  pronunciationError: string | null;
  pronunciationTips: string;
  tipsLoading: boolean;
  audioUrl: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
  onPronunciationStart: () => void;
  onPronunciationStop: () => void;
  onPronunciationSubmit: () => void;
  onPronunciationReset: () => void;
  onRequestTips: () => void;
}

const difficultyConfig: Record<DifficultyLevel, { label: string; color: string; bg: string }> = {
  easy: { label: 'Fácil', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  medium: { label: 'Medio', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  hard: { label: 'Difícil', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

export default function ExercisePopup({
  segment,
  difficulty,
  pronunciationState,
  pronunciationResult,
  pronunciationError,
  pronunciationTips,
  tipsLoading,
  audioUrl,
  onAccept,
  onDecline,
  onComplete,
  onPronunciationStart,
  onPronunciationStop,
  onPronunciationSubmit,
  onPronunciationReset,
  onRequestTips,
}: Props) {
  const config = difficultyConfig[difficulty.difficulty];
  const isPracticing = pronunciationState !== 'idle';
  const isDone = pronunciationState === 'done';

  const cardContent = (
    <div
      className="relative rounded-2xl p-5 sm:p-8 text-center max-h-[85vh] flex flex-col overflow-y-auto"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1.5px solid var(--color-border-strong)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.15)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with difficulty badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[--color-accent-text]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span className="text-base sm:text-lg font-bold text-[--color-text-primary]">
          Pronunciation Exercise
        </span>
      </div>

      {/* Difficulty badge */}
      <div className="flex justify-center mb-4">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
          style={{ color: config.color, backgroundColor: config.bg }}
        >
          {config.label}
        </span>
      </div>

      {!isPracticing ? (
        // Prompt mode: show sentence and ask
        <>
          {/* Original sentence */}
          <div
            className="rounded-xl px-4 py-3 mb-3"
            style={{ backgroundColor: 'var(--color-hover)' }}
          >
            <p className="text-sm text-[--color-text-faint] mb-1">Say this sentence:</p>
            <p className="text-base sm:text-lg font-semibold text-[--color-text-primary] leading-relaxed">
              {segment.text}
            </p>
          </div>

          {/* Translation */}
          {segment.translation && (
            <div
              className="rounded-xl px-4 py-3 mb-6"
              style={{ backgroundColor: 'var(--color-hover)', opacity: 0.8 }}
            >
              <p className="text-sm text-[--color-text-faint] mb-1">Translation:</p>
              <p className="text-sm text-[--color-text-secondary] italic">
                {segment.translation}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onDecline}
              className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-hover)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Skip
            </button>
            <button
              onClick={() => { onAccept(); onPronunciationStart(); }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Practice
            </button>
          </div>
        </>
      ) : (
        // Practice mode: embedded PronunciationPanel
        <div className="text-left">
          <PronunciationPanel
            segmentText={segment.text}
            state={pronunciationState}
            result={pronunciationResult}
            error={pronunciationError}
            pronunciationTips={pronunciationTips}
            tipsLoading={tipsLoading}
            audioUrl={audioUrl}
            onStart={onPronunciationStart}
            onStop={onPronunciationStop}
            onSubmit={onPronunciationSubmit}
            onReset={onPronunciationReset}
            onRequestTips={onRequestTips}
          />

          {/* Continue button after done */}
          {isDone && (
            <div className="flex justify-center mt-4">
              <button
                onClick={onComplete}
                className="px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: centered modal */}
      <div className="hidden sm:flex fixed inset-0 z-50 items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onDecline} />
        <div className="relative z-10 w-full max-w-lg mx-4">
          {cardContent}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="sm:hidden fixed inset-0 z-50 flex items-end">
        <div className="absolute inset-0 bg-black/40" onClick={onDecline} />
        <div className="relative z-10 w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {cardContent}
        </div>
      </div>
    </>
  );
}
