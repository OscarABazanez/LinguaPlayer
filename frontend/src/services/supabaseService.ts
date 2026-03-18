import { supabase } from './supabaseClient';
import type { Segment } from '../types/subtitle';

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export interface VideoRecord {
  id: string;
  file_name: string;
  stored_name: string | null;
  transcription: Segment[] | null;
  learning_language: string;
  native_language: string;
  is_processed: boolean;
  timezone: string;
  created_at: string;
}

export async function saveVideoRecord(
  fileName: string,
  storedName: string | null,
  learningLanguage: string,
  nativeLanguage: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('videos')
    .insert({
      file_name: fileName,
      stored_name: storedName,
      learning_language: learningLanguage,
      native_language: nativeLanguage,
      is_processed: false,
      timezone: getUserTimezone(),
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to save video: ${error.message}`);
  return data.id;
}

export async function markVideoProcessed(
  videoId: string,
  transcription: Segment[],
  learningLanguage: string,
): Promise<void> {
  const { error } = await supabase
    .from('videos')
    .update({
      is_processed: true,
      transcription,
      learning_language: learningLanguage,
    })
    .eq('id', videoId);

  if (error) throw new Error(`Failed to update video: ${error.message}`);
}

export async function saveWordLookup(
  videoId: string,
  word: string,
  sentence: string,
  segmentIndex: number,
): Promise<void> {
  const { error } = await supabase
    .from('word_lookups')
    .insert({
      video_id: videoId,
      word,
      sentence,
      segment_index: segmentIndex,
      timezone: getUserTimezone(),
    });

  if (error) throw new Error(`Failed to save word lookup: ${error.message}`);
}
