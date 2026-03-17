export type WordStatus = 'correct' | 'close' | 'wrong' | 'missing';

export interface WordComparison {
  original: string;
  spoken: string | null;
  textScore: number;        // 0-1
  phoneticScore: number;    // 0-1
  combinedScore: number;    // 0-1
  originalIPA?: string;
  spokenIPA?: string;
  status: WordStatus;
}

export interface PronunciationResult {
  overallScore: number;     // 0-100
  wordComparisons: WordComparison[];
  originalText: string;
  spokenText: string;
  timestamp: Date;
}

export interface PronunciationAttempt {
  id?: number;
  videoId?: number;
  segmentIndex: number;
  originalText: string;
  spokenText: string;
  overallScore: number;
  wordComparisons: WordComparison[];
  language: string;
  createdAt: Date;
}
