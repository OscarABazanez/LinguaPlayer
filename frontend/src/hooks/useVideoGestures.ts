import { useState, useRef, useCallback, useEffect } from 'react';

export type GestureEvent =
  | { type: 'single-tap' }
  | { type: 'double-tap-left' }
  | { type: 'double-tap-right' }
  | { type: 'long-press' };

interface GestureCallbacks {
  onSingleTap: () => void;
  onDoubleTapLeft: () => void;
  onDoubleTapRight: () => void;
  onLongPress: () => void;
}

interface UseVideoGesturesReturn {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
  activeGesture: GestureEvent | null;
}

const DOUBLE_TAP_DELAY = 300; // ms to wait before firing single tap
const LONG_PRESS_DELAY = 500; // ms to hold for long press
const FEEDBACK_DURATION = 700; // ms to show visual feedback

export function useVideoGestures(callbacks: GestureCallbacks): UseVideoGesturesReturn {
  const [activeGesture, setActiveGesture] = useState<GestureEvent | null>(null);

  // Refs for timer IDs
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for gesture state
  const tapCountRef = useRef(0);
  const longPressFiredRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const overlayWidthRef = useRef(0);

  // Stable refs for callbacks to avoid re-creating handlers
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const clearAllTimers = useCallback(() => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
    }
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    tapCountRef.current = 0;
    longPressFiredRef.current = false;
  }, []);

  const showFeedback = useCallback((gesture: GestureEvent) => {
    // Clear previous feedback timer
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setActiveGesture(gesture);
    feedbackTimerRef.current = setTimeout(() => {
      setActiveGesture(null);
      feedbackTimerRef.current = null;
    }, FEEDBACK_DURATION);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Store position info for determining left/right side
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    lastPointerXRef.current = e.clientX - rect.left;
    overlayWidthRef.current = rect.width;
    longPressFiredRef.current = false;

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      callbacksRef.current.onLongPress();
      showFeedback({ type: 'long-press' });
      resetState();
    }, LONG_PRESS_DELAY);
  }, [showFeedback, resetState]);

  const onPointerUp = useCallback(() => {
    // Cancel long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If long press already fired, ignore this pointer up
    if (longPressFiredRef.current) {
      return;
    }

    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      // First tap — wait to see if a second tap comes
      tapTimerRef.current = setTimeout(() => {
        // No second tap arrived → single tap
        callbacksRef.current.onSingleTap();
        showFeedback({ type: 'single-tap' });
        resetState();
        tapTimerRef.current = null;
      }, DOUBLE_TAP_DELAY);
    } else if (tapCountRef.current === 2) {
      // Second tap — it's a double tap
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }

      // Determine left or right side
      const isLeft = lastPointerXRef.current < overlayWidthRef.current / 2;

      if (isLeft) {
        callbacksRef.current.onDoubleTapLeft();
        showFeedback({ type: 'double-tap-left' });
      } else {
        callbacksRef.current.onDoubleTapRight();
        showFeedback({ type: 'double-tap-right' });
      }

      resetState();
    }
  }, [showFeedback, resetState]);

  const onPointerCancel = useCallback(() => {
    clearAllTimers();
    resetState();
  }, [clearAllTimers, resetState]);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent context menu on long press (mobile)
    e.preventDefault();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  return {
    handlers: { onPointerDown, onPointerUp, onPointerCancel, onContextMenu },
    activeGesture,
  };
}
