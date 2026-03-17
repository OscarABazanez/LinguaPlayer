import {
  downloadWhisperModel,
  resampleTo16Khz,
  transcribe,
  type WhisperWebModel,
} from '@remotion/whisper-web';
import { API_BASE, WHISPER_MODEL } from '../utils/constants';
import type { WordComparison } from '../types/pronunciation';

const MODEL: WhisperWebModel = WHISPER_MODEL as WhisperWebModel;

/**
 * Transcribe a short audio recording using Whisper WASM.
 * The model should already be cached from video processing.
 */
export async function transcribeRecording(audioBlob: Blob): Promise<string> {
  // Ensure model is available (should be cached in IndexedDB already)
  await downloadWhisperModel({
    model: MODEL,
    onProgress: () => {}, // Silent — already downloaded
  });

  // Resample to 16kHz
  const channelWaveform = await resampleTo16Khz({
    file: audioBlob,
    onProgress: () => {},
  });

  // Transcribe
  const result = await transcribe({
    channelWaveform,
    model: MODEL,
    language: 'auto',
    onProgress: () => {},
  });

  // Extract text from transcription
  const text = result.transcription
    .map(item => item.text.replace(/\[[^\]]*\]/g, '').trim())
    .filter(Boolean)
    .join(' ')
    .trim();

  return text;
}

/**
 * Convert audio Blob (webm/mp4) to WAV Blob for Whisper.
 */
export async function convertToWav(audioBlob: Blob): Promise<Blob> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  // Convert to WAV
  const numChannels = 1;
  const sampleRate = audioBuffer.sampleRate;
  const bitDepth = 16;

  const channelData = audioBuffer.getChannelData(0);
  const samples = new Int16Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  const dataLength = samples.length * (bitDepth / 8);
  const headerLength = 44;
  const wavBuffer = new ArrayBuffer(headerLength + dataLength);
  const view = new DataView(wavBuffer);

  // WAV header
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, samples[i], true);
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

/**
 * Compute Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Text similarity (0-1) using normalized Levenshtein.
 */
function textSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  const dist = levenshtein(al, bl);
  return 1 - dist / Math.max(al.length, bl.length);
}

/**
 * Clean punctuation from word edges.
 */
function cleanWord(w: string): string {
  return w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();
}

/**
 * Align original words with spoken words using DP.
 */
function alignWords(original: string[], spoken: string[]): Array<[string, string | null]> {
  if (!spoken.length) return original.map(w => [w, null]);

  const n = original.length;
  const m = spoken.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(Infinity));
  const back: Array<Array<[string, number, number] | null>> = Array.from(
    { length: n + 1 },
    () => Array(m + 1).fill(null),
  );

  dp[0][0] = 0;

  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      if (dp[i][j] === Infinity) continue;

      // Skip original word (missing)
      if (i < n) {
        const cost = dp[i][j] + 1;
        if (cost < dp[i + 1][j]) {
          dp[i + 1][j] = cost;
          back[i + 1][j] = ['skip', i, j];
        }
      }

      // Skip spoken word (extra)
      if (j < m) {
        const cost = dp[i][j] + 0.5;
        if (cost < dp[i][j + 1]) {
          dp[i][j + 1] = cost;
          back[i][j + 1] = ['extra', i, j];
        }
      }

      // Match
      if (i < n && j < m) {
        const sim = textSimilarity(cleanWord(original[i]), cleanWord(spoken[j]));
        const cost = dp[i][j] + (1 - sim);
        if (cost < dp[i + 1][j + 1]) {
          dp[i + 1][j + 1] = cost;
          back[i + 1][j + 1] = ['match', i, j];
        }
      }
    }
  }

  // Find best endpoint
  let bestI = n, bestJ = m;
  let bestCost = dp[n][m];
  // Also consider consuming all original words but not all spoken
  for (let j = 0; j <= m; j++) {
    if (dp[n][j] < bestCost) {
      bestCost = dp[n][j];
      bestI = n;
      bestJ = j;
    }
  }

  // Traceback
  const result: Array<[string, string | null]> = [];
  let ci = bestI, cj = bestJ;
  while (ci > 0 || cj > 0) {
    const b = back[ci][cj];
    if (!b) break;
    const [action, pi, pj] = b;
    if (action === 'match') {
      result.push([original[pi], spoken[pj]]);
    } else if (action === 'skip') {
      result.push([original[pi], null]);
    }
    // 'extra' — skip spoken word
    ci = pi;
    cj = pj;
  }

  result.reverse();

  // Ensure any original words not yet in result are added as missing
  const seen = new Set(result.map(r => r[0]));
  for (const w of original) {
    if (!seen.has(w)) {
      result.push([w, null]);
    }
  }

  return result;
}

/**
 * Determine word status from combined score.
 */
function getStatus(score: number, spoken: string | null): WordComparison['status'] {
  if (!spoken) return 'missing';
  if (score >= 0.85) return 'correct';
  if (score >= 0.60) return 'close';
  return 'wrong';
}

/**
 * Full pronunciation analysis.
 * Does text comparison locally and optionally calls backend for IPA analysis.
 */
export async function analyzePronunciation(
  originalText: string,
  spokenText: string,
  language: string,
): Promise<WordComparison[]> {
  const originalWords = originalText.trim().split(/\s+/).filter(Boolean);
  const spokenWords = spokenText.trim().split(/\s+/).filter(Boolean);

  // Align words
  const aligned = alignWords(originalWords, spokenWords);

  // Compute text scores locally
  const localComparisons: WordComparison[] = aligned.map(([orig, spoken]) => {
    const co = cleanWord(orig);
    const cs = spoken ? cleanWord(spoken) : null;
    const txtScore = cs ? textSimilarity(co, cs) : 0;

    return {
      original: orig,
      spoken: spoken,
      textScore: txtScore,
      phoneticScore: txtScore, // Default to text score, updated by backend
      combinedScore: txtScore,
      status: getStatus(txtScore, spoken),
    };
  });

  // Try backend for IPA phonetic analysis
  try {
    const resp = await fetch(`${API_BASE}/pronunciation/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_text: originalText,
        spoken_text: spokenText,
        language,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const backendComps = data.word_comparisons as Array<{
        original: string;
        spoken: string | null;
        original_ipa: string;
        spoken_ipa: string | null;
        phonetic_score: number;
      }>;

      // Merge backend IPA data with local text scores
      return backendComps.map((bc, i) => {
        const local = localComparisons[i] || localComparisons[localComparisons.length - 1];
        const textScore = local?.textScore ?? 0;
        const phoneticScore = bc.phonetic_score;
        const combinedScore = textScore * 0.5 + phoneticScore * 0.5;

        return {
          original: bc.original,
          spoken: bc.spoken,
          textScore,
          phoneticScore,
          combinedScore,
          originalIPA: bc.original_ipa || undefined,
          spokenIPA: bc.spoken_ipa || undefined,
          status: getStatus(combinedScore, bc.spoken),
        };
      });
    }
  } catch {
    // Backend unavailable — use text-only scores
    console.warn('Pronunciation backend unavailable, using text-only scoring');
  }

  return localComparisons;
}
