export type POSTag =
  | 'NOUN' | 'VERB' | 'ADJ' | 'ADV' | 'PRON'
  | 'DET' | 'ADP' | 'CONJ' | 'CCONJ' | 'SCONJ'
  | 'INTJ' | 'NUM' | 'PART' | 'PUNCT' | 'SYM'
  | 'X' | 'AUX' | 'PROPN';

export interface Word {
  text: string;
  cleanWord: string;
  start: number;
  end: number;
  pos?: POSTag;
  lemma?: string;
}

export interface Segment {
  index: number;
  start: number;
  end: number;
  text: string;
  words: Word[];
  translation?: string;
}

export interface TranscriptionResult {
  segments: Segment[];
  detectedLanguage: string;
}
