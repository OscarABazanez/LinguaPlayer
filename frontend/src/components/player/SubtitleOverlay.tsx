import type { Segment, Word } from '../../types/subtitle';
import InteractiveSubtitleLine from '../subtitles/InteractiveSubtitleLine';
import WordPopup from '../popup/WordPopup';

interface Props {
  segment: Segment | null;
  showTranslation: boolean;
  showGrammarColors: boolean;
  onWordClick: (word: Word) => void;
  selectedWord: Word | null;
  onClosePopup: () => void;
  detectedLanguage: string;
  nativeLanguage: string;
  activeWordIndex: number;
}

export default function SubtitleOverlay({
  segment,
  showTranslation,
  showGrammarColors,
  onWordClick,
  selectedWord,
  onClosePopup,
  detectedLanguage,
  nativeLanguage,
  activeWordIndex,
}: Props) {
  if (!segment) {
    return <div className="h-24" />;
  }

  return (
    <div className="relative min-h-[4rem] sm:min-h-[6rem] py-2 sm:py-4 px-2 sm:px-4">
      {/* Original subtitle line — interactive */}
      <div className="text-center">
        <InteractiveSubtitleLine
          words={segment.words}
          showGrammarColors={showGrammarColors}
          onWordClick={onWordClick}
          selectedWord={selectedWord}
          activeWordIndex={activeWordIndex}
          renderPopup={(word, position) => (
            <WordPopup
              word={word}
              onClose={onClosePopup}
              detectedLanguage={detectedLanguage}
              nativeLanguage={nativeLanguage}
              position={position}
            />
          )}
        />
      </div>

      {/* Translation line */}
      {showTranslation && segment.translation && (
        <p className="text-center text-sm text-[--color-text-faint] italic mt-1">
          {segment.translation}
        </p>
      )}
    </div>
  );
}
