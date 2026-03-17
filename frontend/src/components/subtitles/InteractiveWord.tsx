import { useRef, useState, useEffect, type ReactNode } from 'react';
import type { Word } from '../../types/subtitle';
import { getPosColor } from '../../utils/posColors';

export type PopupDirection = 'up' | 'down';

export interface PopupPosition {
  direction: PopupDirection;
  wordCenterX: number; // center X of the word in viewport pixels
  wordTop: number;     // top of the word in viewport pixels
  wordBottom: number;  // bottom of the word in viewport pixels
}

interface Props {
  word: Word;
  showGrammarColor: boolean;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
  renderPopup?: (position: PopupPosition) => ReactNode;
}

export default function InteractiveWord({ word, showGrammarColor, isSelected, isActive, onClick, renderPopup }: Props) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const [popupPos, setPopupPos] = useState<PopupPosition>({
    direction: 'up',
    wordCenterX: 0,
    wordTop: 0,
    wordBottom: 0,
  });

  // When highlighted (active/selected), the highlight text color takes priority over POS grammar color
  const isHighlighted = isSelected || isActive;
  const colorClass = showGrammarColor && !isHighlighted ? getPosColor(word.pos) : '';

  const highlightClass = isSelected
    ? 'bg-[--color-accent-light] text-[--color-selected-text] font-bold rounded px-0.5'
    : isActive
      ? 'inline-block scale-125 bg-[--color-highlight] text-[--color-highlight-text] font-bold rounded-sm px-0.5'
      : '';

  useEffect(() => {
    if (isSelected && wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const wordCenter = rect.top + rect.height / 2;
      const direction: PopupDirection = wordCenter < viewportHeight * 0.4 ? 'down' : 'up';
      setPopupPos({
        direction,
        wordCenterX: rect.left + rect.width / 2,
        wordTop: rect.top,
        wordBottom: rect.bottom,
      });
    }
  }, [isSelected]);

  return (
    <>
      <span className="relative inline" ref={wordRef}>
        <span
          onClick={onClick}
          className={`
            inline cursor-pointer transition-all duration-150
            hover:underline hover:decoration-dotted hover:decoration-[--color-accent-text]
            ${colorClass}
            ${highlightClass}
          `}
        >
          {word.text}
        </span>
        {isSelected && renderPopup && renderPopup(popupPos)}
      </span>
      {' '}
    </>
  );
}
