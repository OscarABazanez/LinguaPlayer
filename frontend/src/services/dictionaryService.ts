export interface WordInfo {
  word: string;
  language: string;
  ipa?: string;
  audioUrl?: string;
  definitions: string[];
  examples: string[];
}

export async function lookupWord(word: string, lang: string): Promise<WordInfo> {
  const results = await Promise.allSettled([
    fetchFreeDictionary(word, lang),
  ]);

  const freeDictResult = results[0].status === 'fulfilled' ? results[0].value : null;

  return {
    word,
    language: lang,
    ipa: freeDictResult?.ipa,
    audioUrl: freeDictResult?.audioUrl,
    definitions: freeDictResult?.definitions ?? [],
    examples: freeDictResult?.examples ?? [],
  };
}

interface FreeDictResult {
  ipa?: string;
  audioUrl?: string;
  definitions: string[];
  examples: string[];
}

async function fetchFreeDictionary(word: string, lang: string): Promise<FreeDictResult> {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${lang}/${encodeURIComponent(word)}`);
  if (!res.ok) return { definitions: [], examples: [] };

  const data = await res.json();
  const entry = data[0];
  if (!entry) return { definitions: [], examples: [] };

  const phonetic = entry.phonetics?.find((p: { audio?: string }) => p.audio) ?? entry.phonetics?.[0];
  const meanings = entry.meanings ?? [];

  const definitions: string[] = [];
  const examples: string[] = [];

  for (const meaning of meanings) {
    for (const def of meaning.definitions ?? []) {
      if (def.definition) definitions.push(def.definition);
      if (def.example) examples.push(def.example);
    }
  }

  return {
    ipa: entry.phonetic ?? phonetic?.text,
    audioUrl: phonetic?.audio || undefined,
    definitions: definitions.slice(0, 3),
    examples: examples.slice(0, 3),
  };
}
