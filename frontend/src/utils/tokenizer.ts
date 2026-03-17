export interface Token {
  text: string;
  cleanWord: string;
  index: number;
  isPunctuation: boolean;
}

const PUNCT_REGEX = /^[.,;:!?¿¡"""''()[\]{}\-—…]+$/;

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  // Split by whitespace, keeping words with attached punctuation
  const parts = text.split(/\s+/).filter(Boolean);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const cleanWord = part.replace(/^[.,;:!?¿¡"""''()\-—…]+|[.,;:!?"""''()\-—…]+$/g, '');
    tokens.push({
      text: part,
      cleanWord: cleanWord || part,
      index: i,
      isPunctuation: PUNCT_REGEX.test(part),
    });
  }

  return tokens;
}
