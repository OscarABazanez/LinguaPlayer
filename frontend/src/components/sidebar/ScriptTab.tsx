import { useEffect, useRef } from 'react';
import type { Segment } from '../../types/subtitle';
import { formatTime } from '../../utils/formatTime';

interface Props {
  segments: Segment[];
  activeSegmentIndex: number;
  onSegmentClick: (segment: Segment) => void;
}

export default function ScriptTab({ segments, activeSegmentIndex, onSegmentClick }: Props) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = activeRef.current;
    if (!active) return;

    // Find the scrollable parent (overflow-y-auto container)
    const scrollParent = active.closest('.overflow-y-auto') as HTMLElement | null;
    if (!scrollParent) return;

    // Calculate scroll position to center active element within the scroll container
    const scrollTarget = active.offsetTop - scrollParent.offsetTop
      - scrollParent.clientHeight / 2 + active.offsetHeight / 2;

    scrollParent.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  }, [activeSegmentIndex]);

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[--color-text-faint] text-sm">
        No transcript available
      </div>
    );
  }

  return (
    <div className="p-2">
      {segments.map((seg) => {
        const isActive = seg.index === activeSegmentIndex;
        return (
          <div
            key={seg.index}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSegmentClick(seg)}
            className={`
              px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 mb-1
              ${isActive
                ? 'bg-[--color-accent-surface] border-l-2 border-[--color-accent]'
                : 'hover:bg-[--color-surface-alt] border-l-2 border-transparent'
              }
            `}
          >
            <span className="text-xs text-[--color-text-faint] font-mono">{formatTime(seg.start)}</span>
            <p className={`text-sm mt-0.5 ${isActive ? 'text-[--color-text-primary] font-medium' : 'text-[--color-text-secondary]'}`}>
              {seg.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
