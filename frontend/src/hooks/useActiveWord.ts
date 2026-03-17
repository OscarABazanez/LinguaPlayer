import { useMemo } from 'react';
import type { Word } from '../types/subtitle';

export function useActiveWord(words: Word[] | undefined, currentTime: number): number {
  return useMemo(() => {
    if (!words || words.length === 0) return -1;
    for (let i = 0; i < words.length; i++) {
      if (currentTime >= words[i].start && currentTime <= words[i].end) {
        return i;
      }
    }
    return -1;
  }, [words, Math.floor(currentTime * 60)]);
}
