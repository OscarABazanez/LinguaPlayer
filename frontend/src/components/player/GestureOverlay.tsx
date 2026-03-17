import type { GestureEvent } from '../../hooks/useVideoGestures';

interface Props {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
  activeGesture: GestureEvent | null;
  isPlaying: boolean;
}

export default function GestureOverlay({ handlers, activeGesture, isPlaying }: Props) {
  return (
    <div
      className="absolute inset-0 z-10 select-none"
      style={{ touchAction: 'manipulation' }}
      role="button"
      aria-label="Video gesture area"
      tabIndex={-1}
      {...handlers}
    >
      {activeGesture && (
        <GestureFeedback gesture={activeGesture} isPlaying={isPlaying} />
      )}
    </div>
  );
}

function GestureFeedback({ gesture, isPlaying }: { gesture: GestureEvent; isPlaying: boolean }) {
  // Position based on gesture type
  const positionClass =
    gesture.type === 'double-tap-left'
      ? 'left-[20%] top-1/2 -translate-x-1/2 -translate-y-1/2'
      : gesture.type === 'double-tap-right'
        ? 'right-[20%] top-1/2 translate-x-1/2 -translate-y-1/2'
        : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2';

  return (
    <div
      className={`absolute ${positionClass} pointer-events-none`}
      style={{
        animation: 'gestureFadeOut 0.7s ease-out forwards',
      }}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm">
        <GestureIcon type={gesture.type} isPlaying={isPlaying} />
      </div>

      {/* Ripple effect for double taps */}
      {(gesture.type === 'double-tap-left' || gesture.type === 'double-tap-right') && (
        <div
          className="absolute inset-0 rounded-full bg-white/20"
          style={{
            animation: 'gestureRipple 0.5s ease-out forwards',
          }}
        />
      )}

      <style>{`
        @keyframes gestureFadeOut {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          70% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
        @keyframes gestureRipple {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function GestureIcon({ type, isPlaying }: { type: GestureEvent['type']; isPlaying: boolean }) {
  const iconClass = 'w-7 h-7 text-white drop-shadow-lg';

  switch (type) {
    case 'single-tap':
      return isPlaying ? (
        // Pause icon (video was playing, now pausing)
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
        </svg>
      ) : (
        // Play icon (video was paused, now playing)
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
        </svg>
      );

    case 'double-tap-left':
      // Rewind chevrons
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M13.28 3.97a.75.75 0 010 1.06L6.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6 0a.75.75 0 010 1.06L12.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
        </svg>
      );

    case 'double-tap-right':
      // Forward chevrons
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M4.72 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 010-1.06zm6 0a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      );

    case 'long-press':
      // Loop icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
  }
}
