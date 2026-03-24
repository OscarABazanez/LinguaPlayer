export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface SegmentDifficulty {
  segmentIndex: number;
  difficulty: DifficultyLevel;
}
