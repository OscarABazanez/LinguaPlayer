import { API_BASE } from '../utils/constants';

export async function translateText(text: string, source: string, target: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source, target }),
    });
    if (!res.ok) throw new Error('Translation failed');
    const data = await res.json();
    return data.translatedText;
  } catch {
    // Fallback to MyMemory API
    return translateWithMyMemory(text, source, target);
  }
}

async function translateWithMyMemory(text: string, source: string, target: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
  const res = await fetch(url);
  if (!res.ok) return text;
  const data = await res.json();
  return data.responseData?.translatedText ?? text;
}

export async function translateBatch(texts: string[], source: string, target: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/translate-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, source, target }),
    });
    if (!res.ok) throw new Error('Batch translation failed');
    const data = await res.json();
    return data.translations;
  } catch {
    // Fallback: translate one-by-one
    return Promise.all(texts.map(t => translateText(t, source, target)));
  }
}
