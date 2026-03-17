import type { Segment, Word } from '../../types/subtitle';
import InteractiveSubtitleLine from './InteractiveSubtitleLine';

interface Props {
  segment: Segment;
  showTranslation: boolean;
  showGrammarColors: boolean;
  onWordClick: (word: Word) => void;
  selectedWord: Word | null;
}

export default function DualSubtitle({ segment, showTranslation, showGrammarColors, onWordClick, selectedWord }: Props) {
  return (
    <div className="text-center space-y-1">
      <InteractiveSubtitleLine
        words={segment.words}
        showGrammarColors={showGrammarColors}
        onWordClick={onWordClick}
        selectedWord={selectedWord}
      />
      {showTranslation && segment.translation && (
        <p className="text-sm text-[--color-text-faint] italic">{segment.translation}</p>
      )}
    </div>
  );
}
