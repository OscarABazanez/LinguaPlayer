import type { RefObject } from 'react';
import type { GestureEvent } from '../../hooks/useVideoGestures';
import GestureOverlay from './GestureOverlay';

interface Props {
  src?: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  onLoadedMetadata: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  gestureHandlers?: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
  activeGesture?: GestureEvent | null;
  isPlaying?: boolean;
}

export default function VideoPlayer({
  src, videoRef, onLoadedMetadata, onPlay, onPause, onEnded,
  gestureHandlers, activeGesture, isPlaying,
}: Props) {
  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        className="w-full aspect-video bg-black"
        playsInline
      />
      {gestureHandlers && (
        <GestureOverlay
          handlers={gestureHandlers}
          activeGesture={activeGesture ?? null}
          isPlaying={isPlaying ?? false}
        />
      )}
    </div>
  );
}
