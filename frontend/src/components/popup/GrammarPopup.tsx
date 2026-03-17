interface Props {
  explanation: string;
  loading: boolean;
  error: string | null;
  sentence: string | null;
  onClose: () => void;
}

export default function GrammarPopup({ explanation, loading, error, sentence, onClose }: Props) {
  const cardContent = (
    <div
      className="relative rounded-2xl p-4 sm:p-6 text-left max-h-[60vh] sm:max-h-[70vh] flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1.5px solid var(--color-border-strong)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[--color-accent-text]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-sm sm:text-base font-bold text-[--color-text-primary]">Grammar Coach</span>
        </div>
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

      {/* Sentence */}
      {sentence && (
        <div className="mb-3 p-2.5 bg-[--color-surface-alt] rounded-lg shrink-0">
          <p className="text-[10px] text-[--color-text-faint] uppercase tracking-widest font-semibold mb-1">Sentence</p>
          <p className="text-xs sm:text-sm text-[--color-text-primary] font-medium italic">&ldquo;{sentence}&rdquo;</p>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-[--color-border] mb-3 shrink-0" />

      {/* Content — scrollable */}
      <div className="overflow-y-auto min-h-0 flex-1">
        {error && (
          <div className="p-3 bg-[--color-error-surface] rounded-lg text-[--color-error-text] text-sm mb-3">
            {error}
          </div>
        )}

        {explanation && (
          <div className="text-xs sm:text-sm text-[--color-text-secondary] leading-relaxed whitespace-pre-wrap">
            {explanation}
          </div>
        )}

        {loading && !explanation && (
          <div className="flex items-center gap-2 py-6 justify-center">
            <span className="w-5 h-5 border-2 border-[--color-accent] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[--color-text-faint]">Analyzing grammar...</span>
          </div>
        )}

        {loading && explanation && (
          <div className="flex items-center gap-2 mt-3">
            <span className="w-3 h-3 border-2 border-[--color-accent] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[--color-text-faint]">Generating...</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Invisible backdrop to close on outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Desktop: positioned above controls with arrow */}
      <div
        className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-[560px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {cardContent}
        {/* Arrow pointing down */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: '100%',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '12px solid var(--color-border-strong)',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 'calc(100% - 1.5px)',
            width: 0,
            height: 0,
            borderLeft: '11px solid transparent',
            borderRight: '11px solid transparent',
            borderTop: '11px solid var(--color-surface)',
          }}
        />
      </div>

      {/* Mobile: fixed at bottom of screen */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-[env(safe-area-inset-bottom,12px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {cardContent}
      </div>
    </>
  );
}
