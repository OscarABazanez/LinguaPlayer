import { useEffect, useRef } from 'react';
import type { Segment } from '../types/subtitle';

interface UseSegmentLoopParams {
  currentTime: number;
  activeSegment: Segment | null;
  isPlaying: boolean;
  autoLoop: boolean;
  autoPause: boolean;
  seek: (time: number) => void;
  pause: () => void;
}

export function useSegmentLoop({
  currentTime, activeSegment, isPlaying,
  autoLoop, autoPause, seek, pause,
}: UseSegmentLoopParams) {
  const handledRef = useRef<number>(-1);

  useEffect(() => {
    if (!activeSegment || !isPlaying) return;
    if (!autoLoop && !autoPause) return;

    if (currentTime >= activeSegment.end - 0.05) {
      if (handledRef.current === activeSegment.index) return;
      handledRef.current = activeSegment.index;

      if (autoLoop) {
        seek(activeSegment.start);
      } else if (autoPause) {
        pause();
      }
    } else {
      if (handledRef.current === activeSegment.index) {
        handledRef.current = -1;
      }
    }
  }, [Math.floor(currentTime * 60), activeSegment, isPlaying, autoLoop, autoPause, seek, pause]);
}
