import Dexie, { type Table } from 'dexie';
import type { Segment } from '../types/subtitle';
import type { SavedWord } from '../types/vocab';
import type { GrammarExplanation } from '../types/grammar';
import type { PronunciationAttempt } from '../types/pronunciation';

export interface CachedVideo {
  id?: number;
  hash: string;
  fileName: string;
  segments: Segment[];
  translations: string[];
  language: string;
  createdAt: Date;
}

class LinguaPlayerDB extends Dexie {
  videos!: Table<CachedVideo>;
  vocab!: Table<SavedWord>;
  grammar!: Table<GrammarExplanation>;
  pronunciation!: Table<PronunciationAttempt>;

  constructor() {
    super('LinguaPlayerDB');
    this.version(1).stores({
      videos: '++id, hash, createdAt',
      vocab: '++id, word, lang, videoId, savedAt',
      grammar: '++id, sentence, videoId, createdAt',
    });
    this.version(2).stores({
      videos: '++id, hash, createdAt',
      vocab: '++id, word, lang, videoId, savedAt',
      grammar: '++id, sentence, videoId, createdAt',
      pronunciation: '++id, videoId, segmentIndex, language, overallScore, createdAt',
    });
  }
}

export const db = new LinguaPlayerDB();
