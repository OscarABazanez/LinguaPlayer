import { useMemo } from 'react';
import type { Segment } from '../types/subtitle';

export function useSubtitleSync(segments: Segment[], currentTime: number) {
  const activeSegmentIndex = useMemo(() => {
    if (segments.length === 0) return -1;

    // Binary search for the active segment
    let low = 0;
    let high = segments.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const seg = segments[mid];

      if (currentTime >= seg.start && currentTime <= seg.end) {
        return mid;
      } else if (currentTime < seg.start) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return -1;
  }, [segments, Math.floor(currentTime * 4)]); // Re-evaluate ~4 times per second

  const activeSegment = activeSegmentIndex >= 0 ? segments[activeSegmentIndex] : null;

  return { activeSegmentIndex, activeSegment };
}
