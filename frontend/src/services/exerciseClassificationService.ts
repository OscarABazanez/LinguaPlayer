import type { Segment } from '../types/subtitle';
import type { DifficultyLevel, SegmentDifficulty } from '../types/exercise';
import { streamRawLLM } from './grammarService';

const BATCH_SIZE = 50;
const MAX_EXERCISES = 15;
const MIN_GAP = 3; // minimum segments between exercises

/**
 * Send segments to LLM for difficulty classification.
 * Batches if >50 segments. Returns array of SegmentDifficulty.
 */
export async function classifySegmentDifficulties(
  segments: Segment[],
  language: string,
): Promise<SegmentDifficulty[]> {
  if (segments.length === 0) return [];

  const batches: Segment[][] = [];
  for (let i = 0; i < segments.length; i += BATCH_SIZE) {
    batches.push(segments.slice(i, i + BATCH_SIZE));
  }

  const allDifficulties: SegmentDifficulty[] = [];

  for (const batch of batches) {
    const offset = batches.indexOf(batch) * BATCH_SIZE;
    const batchResult = await classifyBatch(batch, language, offset);
    allDifficulties.push(...batchResult);
  }

  return allDifficulties;
}

async function classifyBatch(
  segments: Segment[],
  language: string,
  indexOffset: number,
): Promise<SegmentDifficulty[]> {
  const segmentList = segments
    .map((s, i) => `${indexOffset + i}: "${s.text}"`)
    .join('\n');

  const prompt = `You are a language difficulty classifier for ${language} learners.
Classify each subtitle segment by pronunciation difficulty for a language student.

Segments:
${segmentList}

Respond ONLY with a valid JSON array, no explanation:
[{"index": 0, "difficulty": "easy"}, ...]

Criteria:
- easy: common words, simple phonemes, short sentences (1-5 words)
- medium: some uncommon words, moderate length, tricky sounds
- hard: rare vocabulary, complex phoneme clusters, long sentences, idioms

JSON response:`;

  let fullResponse = '';
  try {
    for await (const chunk of streamRawLLM(prompt)) {
      fullResponse += chunk;
    }
  } catch {
    return segments.map((_, i) => ({
      segmentIndex: indexOffset + i,
      difficulty: 'medium' as DifficultyLevel,
    }));
  }

  return parseDifficultyResponse(fullResponse, segments.length, indexOffset);
}

function parseDifficultyResponse(
  response: string,
  expectedCount: number,
  indexOffset: number,
): SegmentDifficulty[] {
  try {
    // Extract JSON array from response (may have extra text around it)
    const match = response.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found');

    const parsed: Array<{ index: number; difficulty: string }> = JSON.parse(match[0]);

    return parsed.map((item) => ({
      segmentIndex: typeof item.index === 'number' ? item.index : indexOffset,
      difficulty: validateDifficulty(item.difficulty),
    }));
  } catch {
    // Fallback: assign medium to all
    return Array.from({ length: expectedCount }, (_, i) => ({
      segmentIndex: indexOffset + i,
      difficulty: 'medium' as DifficultyLevel,
    }));
  }
}

function validateDifficulty(d: string): DifficultyLevel {
  if (d === 'easy' || d === 'medium' || d === 'hard') return d;
  return 'medium';
}

/**
 * Select which segments should become exercises based on pedagogical principles:
 * - ~25% of segments, max 15 exercises
 * - Minimum 3 segments gap between exercises
 * - Progressive difficulty: first third prefers easy/medium, last third allows hard
 * - For short videos (<10 segments), max 3 exercises
 */
export function selectExerciseSegments(
  difficulties: SegmentDifficulty[],
  totalSegments: number,
): Set<number> {
  if (totalSegments === 0) return new Set();

  // Calculate target count
  let targetCount = Math.round(totalSegments * 0.25);
  if (totalSegments < 10) targetCount = Math.min(targetCount, 3);
  targetCount = Math.min(targetCount, MAX_EXERCISES);
  targetCount = Math.max(targetCount, 1);

  // Build difficulty map
  const diffMap = new Map<number, DifficultyLevel>();
  for (const d of difficulties) {
    diffMap.set(d.segmentIndex, d.difficulty);
  }

  // Score segments for selection priority
  const thirdSize = Math.floor(totalSegments / 3);
  const scored = difficulties
    .map((d) => {
      let score = 0;
      // Base score by difficulty
      if (d.difficulty === 'hard') score = 3;
      else if (d.difficulty === 'medium') score = 2;
      else score = 1;

      // Progressive difficulty: penalize hard in first third, boost in last third
      if (d.segmentIndex < thirdSize) {
        if (d.difficulty === 'hard') score -= 1;
      } else if (d.segmentIndex >= totalSegments - thirdSize) {
        if (d.difficulty === 'hard') score += 1;
      }

      return { index: d.segmentIndex, score };
    })
    .sort((a, b) => b.score - a.score); // highest score first

  // Greedy selection with minimum gap
  const selected = new Set<number>();
  const sortedByIndex = [...scored].sort((a, b) => a.index - b.index);

  // First pass: try to select best-scored segments respecting gap
  for (const { index } of scored) {
    if (selected.size >= targetCount) break;
    if (isTooClose(index, selected, MIN_GAP)) continue;
    selected.add(index);
  }

  return selected;
}

function isTooClose(index: number, selected: Set<number>, minGap: number): boolean {
  for (const s of selected) {
    if (Math.abs(index - s) < minGap) return true;
  }
  return false;
}
