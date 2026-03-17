import { API_BASE, LM_STUDIO_URL, LM_STUDIO_MODEL } from '../utils/constants';

export interface GrammarRequest {
  sentence: string;
  word?: string;
  targetLang: string;
  nativeLang: string;
}

function buildPrompt(req: GrammarRequest): string {
  const wordContext = req.word ? `\nThe student clicked on the word: "${req.word}"` : '';
  const wordAnalysis = req.word
    ? `Explanation of "${req.word}" in this context`
    : 'Key grammar points';

  return `You are a language tutor. The student is learning ${req.targetLang} and speaks ${req.nativeLang}.

Analyze this sentence from a video:
"${req.sentence}"
${wordContext}
Provide:
1. Literal and natural translation
2. Grammatical analysis (verb tense, mood, subject)
3. ${wordAnalysis}
4. Idiomatic expressions if any
5. One similar example sentence

Respond in ${req.nativeLang}. Be concise.`;
}

export async function* streamGrammarExplanation(req: GrammarRequest): AsyncGenerator<string> {
  // Try backend first, fall back to direct LM Studio call
  try {
    const backendRes = await fetch(`${API_BASE}/grammar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (backendRes.ok && backendRes.body) {
      const reader = backendRes.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
      }
      return;
    }
  } catch {
    // Backend unavailable, try LM Studio directly
  }

  // Direct call to LM Studio via Vite proxy (avoids CORS)
  const res = await fetch(`/lmstudio/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LM_STUDIO_MODEL,
      messages: [{ role: 'user', content: buildPrompt(req) }],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) throw new Error('Grammar explanation failed');
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const dataStr = line.slice(6).trim();
      if (dataStr === '[DONE]') return;
      try {
        const data = JSON.parse(dataStr);
        const content = data.choices?.[0]?.delta?.content ?? '';
        if (content) yield content;
      } catch {
        continue;
      }
    }
  }
}

export async function getGrammarExplanation(req: GrammarRequest): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of streamGrammarExplanation(req)) {
    chunks.push(chunk);
  }
  return chunks.join('');
}
