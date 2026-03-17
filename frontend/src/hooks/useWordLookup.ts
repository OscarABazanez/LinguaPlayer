import { useState, useEffect, useRef } from 'react';
import { lookupWord, type WordInfo } from '../services/dictionaryService';
import { translateText } from '../services/translationService';

export interface WordLookupResult {
  loading: boolean;
  translation?: string;
  wordInfo?: WordInfo;
  error?: string;
}

const cache = new Map<string, { translation: string; wordInfo: WordInfo }>();

export function useWordLookup(word: string, langCode: string, nativeLang: string) {
  const [result, setResult] = useState<WordLookupResult>({ loading: true });
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    const cacheKey = `${word}:${langCode}:${nativeLang}`;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      setResult({ loading: false, translation: cached.translation, wordInfo: cached.wordInfo });
      return;
    }

    setResult({ loading: true });

    Promise.allSettled([
      lookupWord(word, langCode),
      translateText(word, langCode, nativeLang),
    ]).then(([infoResult, transResult]) => {
      if (abortRef.current) return;

      const wordInfo = infoResult.status === 'fulfilled' ? infoResult.value : undefined;
      const translation = transResult.status === 'fulfilled' ? transResult.value : undefined;

      if (wordInfo && translation) {
        cache.set(cacheKey, { translation, wordInfo });
      }

      setResult({
        loading: false,
        translation,
        wordInfo,
      });
    });

    return () => { abortRef.current = true; };
  }, [word, langCode, nativeLang]);

  return result;
}
