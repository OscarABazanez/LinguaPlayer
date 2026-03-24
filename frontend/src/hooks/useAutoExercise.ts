import { useState, useEffect, useRef, useCallback } from 'react';
import type { Segment } from '../types/subtitle';
import type { SegmentDifficulty } from '../types/exercise';

interface UseAutoExerciseParams {
  currentTime: number;
  activeSegment: Segment | null;
  isPlaying: boolean;
  enabled: boolean;
  exerciseSegments: Set<number> | null;
  exerciseDifficulties: Map<number, SegmentDifficulty> | null;
  exercisedSegments: Set<number>;
  pause: () => void;
}

interface UseAutoExerciseReturn {
  pendingExercise: SegmentDifficulty | null;
  pendingSegment: Segment | null;
  isExerciseActive: boolean;
  acceptExercise: () => void;
  declineExercise: () => void;
  completeExercise: () => void;
}

export function useAutoExercise({
  currentTime,
  activeSegment,
  isPlaying,
  enabled,
  exerciseSegments,
  exerciseDifficulties,
  exercisedSegments,
  pause,
}: UseAutoExerciseParams): UseAutoExerciseReturn {
  const [pendingExercise, setPendingExercise] = useState<SegmentDifficulty | null>(null);
  const [pendingSegment, setPendingSegment] = useState<Segment | null>(null);
  const handledRef = useRef<number>(-1);

  // Detect segment end for exercise-eligible segments
  useEffect(() => {
    if (!enabled || !activeSegment || !isPlaying) return;
    if (!exerciseSegments || !exerciseDifficulties) return;
    if (pendingExercise) return; // already showing an exercise

    const idx = activeSegment.index;

    if (currentTime >= activeSegment.end - 0.05) {
      if (handledRef.current === idx) return;
      handledRef.current = idx;

      if (exerciseSegments.has(idx) && !exercisedSegments.has(idx)) {
        const difficulty = exerciseDifficulties.get(idx);
        if (difficulty) {
          pause();
          setPendingExercise(difficulty);
          setPendingSegment(activeSegment);
        }
      }
    } else {
      if (handledRef.current === idx) {
        handledRef.current = -1;
      }
    }
  }, [Math.floor(currentTime * 60), activeSegment, isPlaying, enabled, exerciseSegments, exerciseDifficulties, exercisedSegments, pause, pendingExercise]);

  const acceptExercise = useCallback(() => {
    // Parent will start pronunciation practice
  }, []);

  const declineExercise = useCallback(() => {
    setPendingExercise(null);
    setPendingSegment(null);
  }, []);

  const completeExercise = useCallback(() => {
    setPendingExercise(null);
    setPendingSegment(null);
  }, []);

  return {
    pendingExercise,
    pendingSegment,
    isExerciseActive: pendingExercise !== null,
    acceptExercise,
    declineExercise,
    completeExercise,
  };
}
