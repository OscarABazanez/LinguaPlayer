export type VideoSourceType = 'file' | 'youtube';

export interface VideoSource {
  type: VideoSourceType;
  file?: File;
  youtubeUrl?: string;
  objectUrl?: string;
  storedName?: string;
}

export type ProcessingStep =
  | 'loading-model'
  | 'extracting-audio'
  | 'transcribing'
  | 'done';

export interface ProcessingState {
  currentStep: ProcessingStep;
  progress: number;
  detectedLanguage?: string;
}
