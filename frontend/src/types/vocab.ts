import type { POSTag } from './subtitle';

export interface SavedWord {
  id?: number;
  word: string;
  lemma: string;
  translation: string;
  definition: string;
  pos: POSTag;
  ipa: string;
  lang: string;
  videoId: number;
  segmentIndex: number;
  timestamp: number;
  savedAt: Date;
}
