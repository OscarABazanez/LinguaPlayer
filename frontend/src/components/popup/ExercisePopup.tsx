import { useState, useEffect, useCallback, useRef } from 'react';
import type { Segment } from '../../types/subtitle';
import type { SegmentDifficulty, DifficultyLevel } from '../../types/exercise';
import type { PracticeState } from '../../hooks/usePronunciationPractice';
import type { PronunciationResult } from '../../types/pronunciation';
import { useTTS } from '../../hooks/useTTS';
import { streamRawLLM } from '../../services/grammarService';
import { getLanguageByCode } from '../../utils/languageCodes';
import { renderMarkdown } from '../../utils/renderMarkdown';
import PronunciationPanel from '../pronunciation/PronunciationPanel';

interface Props {
  segment: Segment;
  difficulty: SegmentDifficulty;
  detectedLanguage: string;
  nativeLanguage: string;
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
  detectedLanguage,
  nativeLanguage,
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

  // TTS
  const { speak, stop, isSpeaking } = useTTS();

  // Pronunciation guide state
  const [guideText, setGuideText] = useState('');
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideVisible, setGuideVisible] = useState(false);
  const abortRef = useRef(false);

  // Reset guide when segment changes
  useEffect(() => {
    setGuideText('');
    setGuideLoading(false);
    setGuideVisible(false);
    abortRef.current = true;
  }, [segment.text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
      stop();
    };
  }, [stop]);

  const fetchGuide = useCallback(async () => {
    setGuideVisible(true);
    setGuideLoading(true);
    setGuideText('');
    abortRef.current = false;

    const nativeLangName = getLanguageByCode(nativeLanguage)?.name ?? nativeLanguage;
    const targetLangName = getLanguageByCode(detectedLanguage)?.name ?? detectedLanguage;

    const prompt = `You are a pronunciation coach. The student is learning ${targetLangName} and their native language is ${nativeLangName}.

They need to pronounce this sentence: "${segment.text}"

For EACH word in the sentence, provide a pronunciation respelling using familiar letter combinations that a ${nativeLangName} speaker would understand. Use simple syllable breakdowns with CAPITAL letters for stressed syllables.

Format each word EXACTLY like this:
**word** → /re-SPELL-ing/
Brief tip (1 sentence max about mouth/tongue position).

Examples of respelling style:
- "menu" → /MEH-nyoo/
- "dessert" → /dih-ZURT/
- "wine" → /wain/
- "comfortable" → /KUMF-ter-bul/

Include ALL words, even simple ones. Be concise. You MUST write all tips and explanations in ${nativeLangName}. Do NOT write in English unless ${nativeLangName} is English.`;

    try {
      const stream = streamRawLLM(prompt);
      let accumulated = '';
      for await (const chunk of stream) {
        if (abortRef.current) break;
        accumulated += chunk;
        setGuideText(accumulated);
      }
    } catch {
      if (!abortRef.current) {
        setGuideText('Failed to load pronunciation guide.');
      }
    } finally {
      setGuideLoading(false);
    }
  }, [segment.text, detectedLanguage, nativeLanguage]);

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
          {/* Original sentence with TTS button */}
          <div
            className="rounded-xl px-4 py-3 mb-3"
            style={{ backgroundColor: 'var(--color-hover)' }}
          >
            <p className="text-sm text-[--color-text-faint] mb-1">Say this sentence:</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-base sm:text-lg font-semibold text-[--color-text-primary] leading-relaxed">
                {segment.text}
              </p>
              <button
                onClick={() => isSpeaking ? stop() : speak(segment.text, detectedLanguage)}
                className={`p-2 rounded-xl transition-colors shrink-0 ${
                  isSpeaking
                    ? 'bg-[--color-accent] text-white'
                    : 'hover:bg-[--color-surface] text-[--color-text-faint] hover:text-[--color-accent-text]'
                }`}
                aria-label={isSpeaking ? 'Stop' : 'Listen'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Translation */}
          {segment.translation && (
            <div
              className="rounded-xl px-4 py-3 mb-3"
              style={{ backgroundColor: 'var(--color-hover)', opacity: 0.8 }}
            >
              <p className="text-sm text-[--color-text-faint] mb-1">Translation:</p>
              <p className="text-sm text-[--color-text-secondary] italic">
                {segment.translation}
              </p>
            </div>
          )}

          {/* Pronunciation guide */}
          {!guideVisible ? (
            <button
              onClick={fetchGuide}
              className="mx-auto mb-4 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              style={{
                backgroundColor: 'var(--color-hover)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              How to pronounce
            </button>
          ) : (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-left"
              style={{ backgroundColor: 'var(--color-hover)' }}
            >
              <p className="text-xs uppercase tracking-widest text-[--color-text-faint] font-semibold mb-2">
                How to pronounce
              </p>
              {guideLoading && !guideText && (
                <div className="flex items-center gap-2 text-sm text-[--color-text-faint]">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading pronunciation guide...
                </div>
              )}
              {guideText && (
                <div className="text-sm text-[--color-text-secondary] space-y-2">
                  {renderMarkdown(guideText)}
                </div>
              )}
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
