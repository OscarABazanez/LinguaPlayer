import { useState, useCallback, useRef } from 'react';
import { streamGrammarExplanation } from '../services/grammarService';

interface GrammarState {
  loading: boolean;
  explanation: string;
  error: string | null;
  sentence: string | null;
}

const cache = new Map<string, string>();

export function useGrammarCoach() {
  const [state, setState] = useState<GrammarState>({
    loading: false,
    explanation: '',
    error: null,
    sentence: null,
  });
  const abortRef = useRef(false);

  const explain = useCallback(async (
    sentence: string,
    targetLang: string,
    nativeLang: string,
    word?: string,
  ) => {
    const cacheKey = `${sentence}:${word ?? ''}`;

    if (cache.has(cacheKey)) {
      setState({
        loading: false,
        explanation: cache.get(cacheKey)!,
        error: null,
        sentence,
      });
      return;
    }

    abortRef.current = false;
    setState({ loading: true, explanation: '', error: null, sentence });

    try {
      let fullText = '';
      for await (const chunk of streamGrammarExplanation({
        sentence,
        word,
        targetLang,
        nativeLang,
      })) {
        if (abortRef.current) return;
        fullText += chunk;
        setState(prev => ({ ...prev, explanation: fullText }));
      }

      cache.set(cacheKey, fullText);
      setState(prev => ({ ...prev, loading: false }));
    } catch (err) {
      if (!abortRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Grammar Coach unavailable. Make sure LM Studio is running.',
        }));
      }
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  return { ...state, explain, cancel };
}
