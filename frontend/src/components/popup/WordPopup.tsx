import type { Word } from '../../types/subtitle';
import type { PopupPosition } from '../subtitles/InteractiveWord';
import { useTTS } from '../../hooks/useTTS';
import { useWordLookup } from '../../hooks/useWordLookup';
import { getPosLabel, getPosBadge } from '../../utils/posColors';

interface Props {
  word: Word;
  onClose: () => void;
  detectedLanguage: string;
  nativeLanguage: string;
  position?: PopupPosition;
}

export default function WordPopup({ word, onClose, detectedLanguage, nativeLanguage, position }: Props) {
  const { speak } = useTTS();
  const lookup = useWordLookup(word.cleanWord, detectedLanguage, nativeLanguage);

  const isUp = position?.direction !== 'down';
  const POPUP_MARGIN = 8; // px from edge of screen

  const cardContent = (
    <div
      className="relative rounded-2xl p-4 sm:p-5 text-left max-h-[50vh] overflow-y-auto"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1.5px solid var(--color-border-strong)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg sm:text-xl font-bold text-[--color-text-primary] truncate">{word.cleanWord}</span>
          {lookup.wordInfo?.ipa && (
            <span className="text-xs sm:text-sm text-[--color-text-faint] font-mono shrink-0">{lookup.wordInfo.ipa}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => speak(word.cleanWord, detectedLanguage)}
            className="p-2 rounded-xl hover:bg-[--color-hover] text-[--color-text-faint] hover:text-[--color-accent-text] transition-colors"
            aria-label="Pronounce"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[--color-hover] text-[--color-text-faint] hover:text-[--color-error-text] transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* POS Badge */}
      {word.pos && (
        <div className="mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPosBadge(word.pos)}`}>
            {getPosLabel(word.pos)}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[--color-border] mb-3" />

      {lookup.loading ? (
        <div className="flex items-center gap-2 py-4 justify-center">
          <span className="w-5 h-5 border-2 border-[--color-accent] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[--color-text-faint]">Looking up...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Translation */}
          {lookup.translation && (
            <div>
              <p className="text-[10px] text-[--color-text-faint] uppercase tracking-widest font-semibold mb-1">Translation</p>
              <p className="text-[--color-text-primary] font-semibold text-base">{lookup.translation}</p>
            </div>
          )}

          {/* Definition */}
          {lookup.wordInfo?.definitions && lookup.wordInfo.definitions.length > 0 && (
            <div>
              <p className="text-[10px] text-[--color-text-faint] uppercase tracking-widest font-semibold mb-1">Definition</p>
              {lookup.wordInfo.definitions.slice(0, 2).map((def, i) => (
                <p key={i} className="text-sm text-[--color-text-secondary] leading-relaxed">
                  {lookup.wordInfo!.definitions.length > 1 && (
                    <span className="text-[--color-accent-text] font-semibold mr-1">{i + 1}.</span>
                  )}
                  {def}
                </p>
              ))}
            </div>
          )}

          {/* Examples */}
          {lookup.wordInfo?.examples && lookup.wordInfo.examples.length > 0 && (
            <div>
              <p className="text-[10px] text-[--color-text-faint] uppercase tracking-widest font-semibold mb-1">Example</p>
              {lookup.wordInfo.examples.slice(0, 1).map((ex, i) => (
                <p key={i} className="text-sm text-[--color-text-muted] italic leading-relaxed">
                  &ldquo;{ex}&rdquo;
                </p>
              ))}
            </div>
          )}

          {/* No results */}
          {!lookup.translation && (!lookup.wordInfo?.definitions || lookup.wordInfo.definitions.length === 0) && (
            <p className="text-sm text-[--color-text-faint] italic py-2">No definition found for this word.</p>
          )}
        </div>
      )}
    </div>
  );

  // Helper: create arrow elements
  const makeArrow = (pointsDown: boolean, leftPx?: number) => {
    const posStyle: React.CSSProperties = leftPx !== undefined
      ? { left: leftPx, transform: 'translateX(-50%)' }
      : { left: '50%', transform: 'translateX(-50%)' };

    if (pointsDown) {
      return (
        <>
          <div className="absolute" style={{ ...posStyle, top: '100%', width: 0, height: 0,
            borderLeft: '12px solid transparent', borderRight: '12px solid transparent',
            borderTop: '12px solid var(--color-border-strong)' }} />
          <div className="absolute" style={{ ...posStyle, top: 'calc(100% - 1.5px)', width: 0, height: 0,
            borderLeft: '11px solid transparent', borderRight: '11px solid transparent',
            borderTop: '11px solid var(--color-surface)' }} />
        </>
      );
    } else {
      return (
        <>
          <div className="absolute" style={{ ...posStyle, bottom: '100%', width: 0, height: 0,
            borderLeft: '12px solid transparent', borderRight: '12px solid transparent',
            borderBottom: '12px solid var(--color-border-strong)' }} />
          <div className="absolute" style={{ ...posStyle, bottom: 'calc(100% - 1.5px)', width: 0, height: 0,
            borderLeft: '11px solid transparent', borderRight: '11px solid transparent',
            borderBottom: '11px solid var(--color-surface)' }} />
        </>
      );
    }
  };

  // Desktop: position classes relative to word
  const positionClass = isUp ? 'bottom-full mb-3' : 'top-full mt-3';

  // Mobile: calculate arrow position within the fixed popup
  // The popup is fixed at left:8px right:8px, so arrow X = wordCenterX - 8px (the left offset)
  const mobileArrowLeft = position ? Math.max(20, Math.min(position.wordCenterX - POPUP_MARGIN, window.innerWidth - POPUP_MARGIN * 2 - 20)) : undefined;

  // Mobile: position the popup near the word
  const mobileStyle: React.CSSProperties = {};
  if (position) {
    if (isUp) {
      // Popup above word: bottom edge at word's top - gap
      mobileStyle.top = 'auto';
      mobileStyle.bottom = `${window.innerHeight - position.wordTop + 12}px`;
    } else {
      // Popup below word: top edge at word's bottom + gap
      mobileStyle.top = `${position.wordBottom + 12}px`;
      mobileStyle.bottom = 'auto';
    }
  }

  return (
    <>
      {/* Invisible backdrop to close on outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Desktop: positioned relative to word with arrow */}
      <div
        className={`hidden sm:block absolute left-1/2 -translate-x-1/2 z-50 w-80 ${positionClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {cardContent}
        {makeArrow(isUp)}
      </div>

      {/* Mobile: fixed near the word with arrow pointing to it */}
      <div
        className="sm:hidden fixed z-50"
        style={{ left: POPUP_MARGIN, right: POPUP_MARGIN, ...mobileStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        {cardContent}
        {makeArrow(isUp, mobileArrowLeft)}
      </div>
    </>
  );
}
