import type { ReactNode } from 'react';
import type { Word } from '../../types/subtitle';
import InteractiveWord, { type PopupPosition } from './InteractiveWord';

interface Props {
  words: Word[];
  showGrammarColors: boolean;
  onWordClick: (word: Word) => void;
  selectedWord: Word | null;
  activeWordIndex: number;
  renderPopup?: (word: Word, position: PopupPosition) => ReactNode;
}

export default function InteractiveSubtitleLine({ words, showGrammarColors, onWordClick, selectedWord, activeWordIndex, renderPopup }: Props) {
  return (
    <div className="text-base sm:text-lg font-medium text-[--color-text-primary] leading-relaxed inline">
      {words.map((word, i) => {
        const isSelected = selectedWord?.text === word.text && selectedWord?.start === word.start;
        return (
          <InteractiveWord
            key={`${word.text}-${i}`}
            word={word}
            showGrammarColor={showGrammarColors}
            isSelected={isSelected}
            isActive={i === activeWordIndex}
            onClick={() => onWordClick(word)}
            renderPopup={isSelected && renderPopup ? (pos) => renderPopup(word, pos) : undefined}
          />
        );
      })}
    </div>
  );
}
