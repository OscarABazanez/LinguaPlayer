interface Props {
  explanation: string;
  loading: boolean;
  error: string | null;
  sentence: string | null;
}

export default function GrammarTab({ explanation, loading, error, sentence }: Props) {
  if (!explanation && !loading && !error) {
    return (
      <div className="flex items-center justify-center h-40 text-[--color-text-faint] text-sm">
        <div className="text-center">
          <p className="mb-1">No grammar explanations yet</p>
          <p className="text-xs">Use the lightbulb button to analyze sentences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {sentence && (
        <div className="mb-4 p-3 bg-[--color-surface-alt] rounded-lg">
          <p className="text-xs text-[--color-text-faint] uppercase tracking-wider mb-1">Sentence</p>
          <p className="text-sm text-[--color-text-primary] font-medium italic">&ldquo;{sentence}&rdquo;</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[--color-error-surface] rounded-lg text-[--color-error-text] text-sm mb-3">
          {error}
        </div>
      )}

      {explanation && (
        <div className="prose prose-sm max-w-none text-[--color-text-secondary] leading-relaxed whitespace-pre-wrap">
          {explanation}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 mt-2">
          <span className="w-3 h-3 border-2 border-[--color-accent] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[--color-text-faint]">Generating explanation...</span>
        </div>
      )}
    </div>
  );
}
