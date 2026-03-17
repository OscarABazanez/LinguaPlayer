import { useState } from 'react';
import type { WordComparison } from '../../types/pronunciation';

interface Props {
  comparison: WordComparison;
}

export default function WordFeedback({ comparison }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClass = {
    correct: 'text-green-500',
    close: 'text-yellow-500',
    wrong: 'text-red-500',
    missing: 'text-[--color-text-faint] line-through',
  }[comparison.status];

  const bgClass = {
    correct: 'bg-green-500/10',
    close: 'bg-yellow-500/10',
    wrong: 'bg-red-500/10',
    missing: 'bg-[--color-hover]',
  }[comparison.status];

  const hasIPA = comparison.originalIPA || comparison.spokenIPA;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={() => setShowTooltip(prev => !prev)}
    >
      <span
        className={`
          inline-block px-1 py-0.5 rounded font-medium cursor-default
          transition-colors duration-150
          ${colorClass} ${bgClass}
        `}
      >
        {comparison.original}
      </span>

      {/* Tooltip with IPA comparison */}
      {showTooltip && (hasIPA || comparison.spoken) && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
            rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-strong)',
          }}
        >
          <div className="space-y-1">
            {comparison.originalIPA && (
              <div className="flex items-center gap-2">
                <span className="text-[--color-text-faint]">Expected:</span>
                <span className="font-mono text-[--color-text-primary]">[{comparison.originalIPA}]</span>
              </div>
            )}
            {comparison.spoken && (
              <div className="flex items-center gap-2">
                <span className="text-[--color-text-faint]">You said:</span>
                <span className={`font-semibold ${colorClass}`}>{comparison.spoken}</span>
                {comparison.spokenIPA && (
                  <span className="font-mono text-[--color-text-muted]">[{comparison.spokenIPA}]</span>
                )}
              </div>
            )}
            {comparison.status === 'missing' && (
              <div className="text-[--color-text-faint] italic">Word not detected</div>
            )}
            <div className="text-[--color-text-faint]">
              Score: {Math.round(comparison.combinedScore * 100)}%
            </div>
          </div>
          {/* Arrow */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2"
            style={{
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--color-border-strong)',
            }}
          />
        </div>
      )}
    </span>
  );
}
