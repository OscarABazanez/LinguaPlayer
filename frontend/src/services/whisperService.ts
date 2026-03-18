import {
  canUseWhisperWeb,
  downloadWhisperModel,
  resampleTo16Khz,
  transcribe,
  type TranscriptionJson,
  type WhisperWebModel,
} from '@remotion/whisper-web';
import type { Segment, Word } from '../types/subtitle';
import { tokenize } from '../utils/tokenizer';

export type TranscriptionStep =
  | 'checking'
  | 'downloading-model'
  | 'extracting-audio'
  | 'transcribing'
  | 'done';

export interface TranscriptionProgress {
  step: TranscriptionStep;
  progress: number; // 0-100
  message: string;
}

export interface TranscriptionResult {
  segments: Segment[];
  detectedLanguage: string;
}

const MODEL: WhisperWebModel = 'base';

export async function transcribeVideo(
  file: File,
  onProgress: (p: TranscriptionProgress) => void,
  language: string = 'auto',
): Promise<TranscriptionResult> {

  // Step 1: Check support
  onProgress({ step: 'checking', progress: 0, message: 'Checking browser support...' });
  const support = await canUseWhisperWeb(MODEL);
  if (!support.supported) {
    throw new Error(
      `Whisper Web not supported: ${support.reason}. ${support.detailedReason ?? ''}`,
    );
  }

  // Step 2: Download model (cached in IndexedDB after first download)
  onProgress({ step: 'downloading-model', progress: 5, message: 'Loading Whisper model...' });
  await downloadWhisperModel({
    model: MODEL,
    onProgress: (p) => {
      const pct = Math.round(5 + p.progress * 25);
      onProgress({
        step: 'downloading-model',
        progress: pct,
        message: p.progress < 1
          ? `Downloading model... ${Math.round(p.progress * 100)}%`
          : 'Model ready',
      });
    },
  });

  // Step 3: Extract and resample audio to 16kHz
  onProgress({ step: 'extracting-audio', progress: 30, message: 'Extracting audio...' });
  const audioBlob = await extractAudioBlob(file);
  const channelWaveform = await resampleTo16Khz({
    file: audioBlob,
    onProgress: (p) => {
      const pct = Math.round(30 + p * 20);
      onProgress({
        step: 'extracting-audio',
        progress: pct,
        message: `Resampling audio... ${Math.round(p * 100)}%`,
      });
    },
  });

  // Step 4: Transcribe
  onProgress({ step: 'transcribing', progress: 50, message: 'Transcribing with Whisper...' });
  const result = await transcribe({
    channelWaveform,
    model: MODEL,
    language,
    onProgress: (p) => {
      const pct = Math.round(50 + p * 45);
      onProgress({
        step: 'transcribing',
        progress: pct,
        message: `Transcribing... ${Math.round(p * 100)}%`,
      });
    },
  });

  // Step 5: Convert result to our Segment format
  onProgress({ step: 'done', progress: 100, message: 'Done!' });

  const detectedLanguage = result.result?.language ?? 'en';
  const segments = convertToSegments(result);

  return { segments, detectedLanguage };
}

/**
 * Extract audio from video file as a Blob suitable for resampleTo16Khz.
 * Uses OfflineAudioContext to decode and re-encode as WAV.
 */
async function extractAudioBlob(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  // Convert AudioBuffer to WAV Blob
  const wavBuffer = audioBufferToWav(audioBuffer);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

/**
 * Convert AudioBuffer to WAV ArrayBuffer
 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = 1; // mono
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Mix down to mono
  const channelData = buffer.getChannelData(0);
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
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write samples
  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(offset + i * 2, samples[i], true);
  }

  return wavBuffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Convert Whisper transcription output to our Segment[] format.
 */
// Whisper special tokens that should not be displayed
// These can appear as full tokens like [_BEG_] or split into sub-word tokens: [, BEG, ], _TT_, 208] etc.
function isSpecialToken(text: string): boolean {
  // Full bracketed tokens: [_BEG_], [_TT_208], etc.
  if (/^\[.*\]$/.test(text)) return true;
  // Standalone brackets or underscore-only tokens
  if (/^[\[\]_]+$/.test(text)) return true;
  // Whisper special words (with optional underscores/brackets)
  if (/^[\[_]*(BEG|TT|SOT|EOT|BLANK|NOSPEECH|NO_TIMESTAMPS|STARTOFLM|STARTOFTRANSCRIPT|NOTIMESTAMPS)[\]_]*$/i.test(text)) return true;
  // Numeric tokens ending with ] (part of [_TT_208])
  if (/^\d+\]$/.test(text)) return true;
  return false;
}

function stripSpecialTokens(text: string): string {
  return text.replace(/\[[^\]]*\]/g, '').trim();
}

function convertToSegments(result: TranscriptionJson): Segment[] {
  const segments: Segment[] = [];

  for (let i = 0; i < result.transcription.length; i++) {
    const item = result.transcription[i];
    const startMs = item.offsets.from;
    const endMs = item.offsets.to;
    const text = stripSpecialTokens(item.text);

    if (!text) continue;

    // Build words from tokens if available, otherwise tokenize text
    let words: Word[];
    if (item.tokens && item.tokens.length > 0) {
      // Filter out special tokens first
      const filtered = item.tokens.filter(t => {
        const trimmed = t.text.trim();
        return trimmed && !isSpecialToken(trimmed);
      });

      // Merge sub-word tokens into whole words.
      // Whisper BPE convention: a token starting with a space begins a new word,
      // tokens without leading space are continuations of the previous word.
      const merged: { text: string; start: number; end: number }[] = [];
      for (const t of filtered) {
        const startsNewWord = t.text.startsWith(' ') || merged.length === 0;
        const cleanText = t.text.trimStart();
        if (!cleanText) continue;

        if (startsNewWord || merged.length === 0) {
          merged.push({
            text: cleanText,
            start: t.offsets.from / 1000,
            end: t.offsets.to / 1000,
          });
        } else {
          // Continuation — append to previous word
          const prev = merged[merged.length - 1];
          prev.text += cleanText;
          prev.end = t.offsets.to / 1000;
        }
      }

      words = merged.map(m => ({
        text: m.text,
        cleanWord: m.text.replace(/^[.,;:!?¿¡"""''()\-—…]+|[.,;:!?"""''()\-—…]+$/g, '') || m.text,
        start: m.start,
        end: m.end,
      }));
    } else {
      const tokens = tokenize(text);
      const segDuration = (endMs - startMs) / 1000;
      const wordDuration = tokens.length > 0 ? segDuration / tokens.length : segDuration;

      words = tokens.map((t, j) => ({
        text: t.text,
        cleanWord: t.cleanWord,
        start: startMs / 1000 + j * wordDuration,
        end: startMs / 1000 + (j + 1) * wordDuration,
      }));
    }

    segments.push({
      index: segments.length,
      start: startMs / 1000,
      end: endMs / 1000,
      text,
      words,
    });
  }

  return segments;
}
