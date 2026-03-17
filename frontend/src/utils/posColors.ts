import type { POSTag } from '../types/subtitle';

export const POS_COLORS: Record<string, string> = {
  NOUN: 'text-[--color-pos-noun]',
  PROPN: 'text-[--color-pos-noun]',
  VERB: 'text-[--color-pos-verb]',
  AUX: 'text-[--color-pos-verb]',
  ADJ: 'text-[--color-pos-adj]',
  ADV: 'text-[--color-pos-adv]',
  PRON: 'text-[--color-pos-pron]',
  DET: 'text-[--color-pos-det]',
  ADP: 'text-[--color-pos-adp]',
  CONJ: 'text-[--color-pos-conj]',
  CCONJ: 'text-[--color-pos-conj]',
  SCONJ: 'text-[--color-pos-conj]',
  INTJ: 'text-[--color-pos-intj]',
  NUM: 'text-[--color-text-secondary]',
  PART: 'text-[--color-text-muted]',
  PUNCT: 'text-[--color-text-faint]',
  SYM: 'text-[--color-text-faint]',
  X: 'text-[--color-text-muted]',
};

export const POS_LABELS: Record<string, string> = {
  NOUN: 'Sustantivo',
  PROPN: 'Nombre propio',
  VERB: 'Verbo',
  AUX: 'Auxiliar',
  ADJ: 'Adjetivo',
  ADV: 'Adverbio',
  PRON: 'Pronombre',
  DET: 'Determinante',
  ADP: 'Preposición',
  CONJ: 'Conjunción',
  CCONJ: 'Conjunción',
  SCONJ: 'Conjunción sub.',
  INTJ: 'Interjección',
  NUM: 'Número',
  PART: 'Partícula',
  PUNCT: 'Puntuación',
};

export const POS_BADGE_COLORS: Record<string, string> = {
  NOUN: 'bg-[--color-pos-badge-noun-bg] text-[--color-pos-badge-noun-text]',
  PROPN: 'bg-[--color-pos-badge-noun-bg] text-[--color-pos-badge-noun-text]',
  VERB: 'bg-[--color-pos-badge-verb-bg] text-[--color-pos-badge-verb-text]',
  AUX: 'bg-[--color-pos-badge-verb-bg] text-[--color-pos-badge-verb-text]',
  ADJ: 'bg-[--color-pos-badge-adj-bg] text-[--color-pos-badge-adj-text]',
  ADV: 'bg-[--color-pos-badge-adv-bg] text-[--color-pos-badge-adv-text]',
  PRON: 'bg-[--color-pos-badge-pron-bg] text-[--color-pos-badge-pron-text]',
  DET: 'bg-[--color-pos-badge-det-bg] text-[--color-pos-badge-det-text]',
  ADP: 'bg-[--color-pos-badge-adp-bg] text-[--color-pos-badge-adp-text]',
  INTJ: 'bg-[--color-pos-badge-intj-bg] text-[--color-pos-badge-intj-text]',
};

export function getPosColor(pos?: POSTag): string {
  if (!pos) return '';
  return POS_COLORS[pos] ?? 'text-[--color-text-muted]';
}

export function getPosBadge(pos?: POSTag): string {
  if (!pos) return 'bg-[--color-pos-badge-default-bg] text-[--color-pos-badge-default-text]';
  return POS_BADGE_COLORS[pos] ?? 'bg-[--color-pos-badge-default-bg] text-[--color-pos-badge-default-text]';
}

export function getPosLabel(pos?: POSTag): string {
  if (!pos) return '';
  return POS_LABELS[pos] ?? pos;
}
