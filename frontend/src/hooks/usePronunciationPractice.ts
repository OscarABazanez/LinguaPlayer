import { useState, useCallback, useRef } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import {
  transcribeRecording,
  convertToWav,
  analyzePronunciation,
} from '../services/pronunciationService';
import { streamRawLLM } from '../services/grammarService';
import type { PronunciationResult } from '../types/pronunciation';
import { db } from '../db/database';
import { getLanguageByCode } from '../utils/languageCodes';

export type PracticeState = 'idle' | 'recording' | 'review' | 'transcribing' | 'analyzing' | 'done' | 'error';

interface UsePronunciationPractice {
  state: PracticeState;
  result: PronunciationResult | null;
  error: string | null;
  pronunciationTips: string;
  tipsLoading: boolean;
  audioUrl: string | null;

  startPractice: (segmentText: string, language: string, nativeLanguage: string) => Promise<void>;
  stopPractice: () => Promise<void>;
  submitRecording: () => Promise<void>;
  reset: () => void;
  requestTips: (nativeLanguage: string) => void;
}

export function usePronunciationPractice(): UsePronunciationPractice {
  const recorder = useAudioRecorder();
  const [state, setState] = useState<PracticeState>('idle');
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState('');
  const [tipsLoading, setTipsLoading] = useState(false);

  const segmentTextRef = useRef('');
  const languageRef = useRef('');
  const nativeLanguageRef = useRef('');
  const abortRef = useRef(false);
  const audioBlobRef = useRef<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const startPractice = useCallback(async (segmentText: string, language: string, nativeLanguage: string) => {
    segmentTextRef.current = segmentText;
    languageRef.current = language;
    nativeLanguageRef.current = nativeLanguage;
    setError(null);
    setResult(null);
    setTips('');
    abortRef.current = false;

    try {
      await recorder.startRecording();
      setState('recording');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setState('error');
    }
  }, [recorder]);

  const stopPractice = useCallback(async () => {
    if (state !== 'recording') return;

    const audioBlob = await recorder.stopRecording();

    if (!audioBlob || abortRef.current) {
      setState('idle');
      return;
    }

    // Save blob and create preview URL
    audioBlobRef.current = audioBlob;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(audioBlob));
    setState('review');
  }, [state, recorder, audioUrl]);

  const submitRecording = useCallback(async () => {
    if (state !== 'review' || !audioBlobRef.current) return;

    try {
      setState('transcribing');

      // Convert to WAV for Whisper
      const wavBlob = await convertToWav(audioBlobRef.current);

      // Transcribe with Whisper WASM
      const spokenText = await transcribeRecording(wavBlob);

      if (abortRef.current) {
        setState('idle');
        return;
      }

      if (!spokenText.trim()) {
        setError('No speech detected. Please try again and speak clearly.');
        setState('error');
        return;
      }

      // Analyze pronunciation
      setState('analyzing');
      const wordComparisons = await analyzePronunciation(
        segmentTextRef.current,
        spokenText,
        languageRef.current,
      );

      if (abortRef.current) {
        setState('idle');
        return;
      }

      // Calculate overall score
      const scoredWords = wordComparisons.filter(w => w.status !== 'missing');
      const overallScore = scoredWords.length > 0
        ? Math.round(
            (scoredWords.reduce((sum, w) => sum + w.combinedScore, 0) / scoredWords.length) * 100,
          )
        : 0;

      const pronunciationResult: PronunciationResult = {
        overallScore,
        wordComparisons,
        originalText: segmentTextRef.current,
        spokenText,
        timestamp: new Date(),
      };

      setResult(pronunciationResult);
      setState('done');

      // Cleanup audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      audioBlobRef.current = null;

      // Save to IndexedDB
      try {
        await db.table('pronunciation').add({
          segmentIndex: 0,
          originalText: segmentTextRef.current,
          spokenText,
          overallScore,
          wordComparisons,
          language: languageRef.current,
          createdAt: new Date(),
        });
      } catch {
        // IndexedDB save is non-critical
      }

      // Auto-request respelling tips if there are problem words
      const hasProblemWords = wordComparisons.some(
        w => w.status === 'wrong' || w.status === 'close',
      );
      if (hasProblemWords && nativeLanguageRef.current) {
        autoRequestTips(pronunciationResult, nativeLanguageRef.current);
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setState('error');
      }
    }
  }, [state, audioUrl]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState('idle');
    setResult(null);
    setError(null);
    setTips('');
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    audioBlobRef.current = null;
  }, [audioUrl]);

  const fetchTips = useCallback(async (pronunciationResult: PronunciationResult, nativeLanguage: string) => {
    setTipsLoading(true);
    setTips('');

    const nativeLangName = getLanguageByCode(nativeLanguage)?.name ?? nativeLanguage;
    const targetLangName = getLanguageByCode(languageRef.current)?.name ?? languageRef.current;

    const problemWords = pronunciationResult.wordComparisons
      .filter(w => w.status === 'wrong' || w.status === 'close')
      .map(w => {
        const parts = [`"${w.original}"`];
        if (w.spoken) parts.push(`(student said: "${w.spoken}")`);
        return parts.join(' ');
      })
      .join(', ');

    const prompt = `You are a pronunciation coach. The student is learning ${targetLangName} and their native language is ${nativeLangName}.

They tried to say: "${pronunciationResult.originalText}"
They actually said: "${pronunciationResult.spokenText}"

The following words were mispronounced: ${problemWords}

For EACH mispronounced word, provide a pronunciation respelling using familiar letter combinations that a ${nativeLangName} speaker would understand. Use simple syllable breakdowns with CAPITAL letters for stressed syllables.

Format each word EXACTLY like this:
**word** → /re-SPELL-ing/
Brief tip (1 sentence max about mouth/tongue position).

Examples of respelling style:
- "menu" → /MEH-nyoo/
- "dessert" → /dih-ZURT/
- "wine" → /wain/
- "comfortable" → /KUMF-ter-bul/

ONLY include the mispronounced words. Be concise. You MUST write all tips and explanations in ${nativeLangName}. Do NOT write in English unless ${nativeLangName} is English.`;

    try {
      const stream = streamRawLLM(prompt);

      let accumulated = '';
      for await (const chunk of stream) {
        if (abortRef.current) break;
        accumulated += chunk;
        setTips(accumulated);
      }
    } catch {
      setTips('Unable to generate pronunciation tips. Please try again.');
    } finally {
      setTipsLoading(false);
    }
  }, []);

  // Internal auto-trigger (called after analysis completes)
  const autoRequestTips = useCallback((pronunciationResult: PronunciationResult, nativeLanguage: string) => {
    fetchTips(pronunciationResult, nativeLanguage);
  }, [fetchTips]);

  // Manual trigger (from UI button)
  const requestTips = useCallback(async (nativeLanguage: string) => {
    if (!result || tipsLoading) return;
    nativeLanguageRef.current = nativeLanguage;
    fetchTips(result, nativeLanguage);
  }, [result, tipsLoading, fetchTips]);

  return {
    state,
    result,
    error,
    pronunciationTips: tips,
    tipsLoading,
    audioUrl,
    startPractice,
    stopPractice,
    submitRecording,
    reset,
    requestTips,
  };
}
