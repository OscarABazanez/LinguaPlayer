import { useState } from 'react';

interface Props {
  onSubmit: (url: string) => void;
}

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;

export default function YouTubeInput({ onSubmit }: Props) {
  const [url, setUrl] = useState('');

  const isValid = YOUTUBE_REGEX.test(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a YouTube URL..."
        className="flex-1 px-4 py-3 rounded-xl border border-[--color-border-strong] bg-[--color-surface] text-[--color-text-primary] placeholder-[--color-text-faint] focus:outline-none focus:ring-2 focus:ring-[--color-accent] focus:border-transparent transition-shadow"
      />
      <button
        type="submit"
        disabled={!isValid}
        className="px-5 py-3 rounded-xl bg-[--color-accent] text-white font-medium hover:bg-[--color-accent-hover] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      </button>
    </form>
  );
}
