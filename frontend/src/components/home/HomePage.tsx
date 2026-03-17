import { useAppState, useAppDispatch } from '../../stores/appStore';
import DropZone from './DropZone';
import YouTubeInput from './YouTubeInput';
import LanguageSelector from './LanguageSelector';

export default function HomePage() {
  const { nativeLanguage } = useAppState();
  const dispatch = useAppDispatch();

  const handleFileSelected = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    dispatch({ type: 'SET_VIDEO_SOURCE', source: { type: 'file', file, objectUrl } });
    dispatch({ type: 'SET_SCREEN', screen: 'processing' });
  };

  const handleYouTubeSubmit = (url: string) => {
    dispatch({ type: 'SET_VIDEO_SOURCE', source: { type: 'youtube', youtubeUrl: url } });
    dispatch({ type: 'SET_SCREEN', screen: 'processing' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-bold text-[--color-text-primary] tracking-tight mb-2 sm:mb-3">
          Learn languages from any video
        </h2>
        <p className="text-sm sm:text-lg text-[--color-text-muted]">
          Upload a video or paste a YouTube URL to get started with interactive subtitles.
        </p>
      </div>

      <div className="bg-[--color-surface] rounded-2xl shadow-sm border border-[--color-border] p-4 sm:p-8 space-y-6 sm:space-y-8">
        <DropZone onFileSelected={handleFileSelected} />

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[--color-border]" />
          <span className="text-sm text-[--color-text-faint] font-medium">or</span>
          <div className="flex-1 h-px bg-[--color-border]" />
        </div>

        <YouTubeInput onSubmit={handleYouTubeSubmit} />

        <div className="pt-2">
          <LanguageSelector
            value={nativeLanguage}
            onChange={(lang) => dispatch({ type: 'SET_NATIVE_LANGUAGE', language: lang })}
            label="Your native language"
          />
        </div>
      </div>
    </div>
  );
}
