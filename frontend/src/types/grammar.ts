export interface GrammarExplanation {
  id?: number;
  sentence: string;
  word?: string;
  explanation: string;
  videoId: number;
  segmentIndex: number;
  createdAt: Date;
}
