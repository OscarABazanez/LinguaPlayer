import { useCallback, useRef } from 'react';
import { formatTime } from '../../utils/formatTime';

interface Props {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export default function ProgressSeekBar({ currentTime, duration, onSeek }: Props) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  }, [duration, onSeek]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="px-1 pb-2 sm:pb-4">
      <div
        ref={barRef}
        onClick={handleClick}
        className="relative h-2 sm:h-1.5 bg-[--color-border] rounded-full cursor-pointer group touch-none"
      >
        <div
          className="absolute inset-y-0 left-0 bg-[--color-accent] rounded-full transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[--color-accent] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-[--color-text-faint]">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
