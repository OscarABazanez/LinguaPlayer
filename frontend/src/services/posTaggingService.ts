import { API_BASE } from '../utils/constants';
import type { POSTag } from '../types/subtitle';

export interface POSToken {
  text: string;
  pos: POSTag;
  lemma: string;
}

export async function posTag(text: string, lang: string): Promise<POSToken[]> {
  const res = await fetch(`${API_BASE}/pos-tag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang }),
  });
  if (!res.ok) throw new Error('POS tagging failed');
  const data = await res.json();
  return data.tokens;
}

export async function posTagBatch(segments: { text: string }[], lang: string): Promise<POSToken[][]> {
  const res = await fetch(`${API_BASE}/pos-tag-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments, lang }),
  });
  if (!res.ok) throw new Error('Batch POS tagging failed');
  const data = await res.json();
  return data.results;
}
