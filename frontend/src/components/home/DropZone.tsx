import { useCallback, useRef, useState } from 'react';
import { SUPPORTED_VIDEO_TYPES } from '../../utils/constants';

interface Props {
  onFileSelected: (file: File) => void;
}

export default function DropZone({ onFileSelected }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidVideo(file)) {
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidVideo(file)) {
      onFileSelected(file);
    }
  }, [onFileSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragging
          ? 'border-[--color-accent] bg-[--color-accent-surface]'
          : 'border-[--color-border-strong] hover:border-[--color-border-strong] hover:bg-[--color-surface-alt]'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/x-matroska,.mkv"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-[--color-hover] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[--color-text-faint]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="text-[--color-text-secondary] font-medium">
            Drag a video here or click to browse
          </p>
          <p className="text-sm text-[--color-text-faint] mt-1">
            MP4, MKV, WebM
          </p>
        </div>
      </div>
    </div>
  );
}

function isValidVideo(file: File): boolean {
  return SUPPORTED_VIDEO_TYPES.includes(file.type) || file.name.endsWith('.mkv');
}
