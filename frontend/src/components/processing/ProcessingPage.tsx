import { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../../stores/appStore';
import type { ProcessingStep } from '../../types/video';
import ProgressBar from './ProgressBar';
import LanguageConfirm from './LanguageConfirm';
import { transcribeVideo, type TranscriptionProgress } from '../../services/whisperService';

interface StepInfo {
  key: ProcessingStep;
  label: string;
}

const STEPS: StepInfo[] = [
  { key: 'loading-model', label: 'Loading Whisper model...' },
  { key: 'extracting-audio', label: 'Extracting audio...' },
  { key: 'transcribing', label: 'Transcribing with Whisper...' },
  { key: 'done', label: 'Ready!' },
];

// Map whisper service steps to our ProcessingStep
function mapStep(step: TranscriptionProgress['step']): ProcessingStep {
  switch (step) {
    case 'checking': return 'loading-model';
    case 'downloading-model': return 'loading-model';
    case 'extracting-audio': return 'extracting-audio';
    case 'transcribing': return 'transcribing';
    case 'done': return 'done';
  }
}

export default function ProcessingPage() {
  const { videoSource } = useAppState();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('loading-model');
  const [progress, setProgress] = useState(0);
  const [detectedLang, setDetectedLang] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoSource?.file) return;

    let cancelled = false;

    async function process() {
      try {
        const result = await transcribeVideo(videoSource!.file!, (p: TranscriptionProgress) => {
          if (cancelled) return;
          setCurrentStep(mapStep(p.step));
          setProgress(p.progress);
        });

        if (cancelled) return;

        setDetectedLang(result.detectedLanguage);
        dispatch({ type: 'SET_DETECTED_LANGUAGE', language: result.detectedLanguage });
        setCurrentStep('done');
        setProgress(100);

        // Wait a moment then transition
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) return;

        dispatch({ type: 'SET_SEGMENTS', segments: result.segments });
        dispatch({ type: 'SET_SCREEN', screen: 'player' });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Processing failed');
        }
      }
    }

    process();
    return () => { cancelled = true; };
  }, [videoSource, dispatch]);

  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="max-w-lg mx-auto px-6 py-20">
      <div className="bg-[--color-surface] rounded-2xl shadow-sm border border-[--color-border] p-8">
        <h2 className="text-xl font-semibold text-[--color-text-primary] text-center mb-8">
          Processing your video...
        </h2>

        <ProgressBar progress={progress} />

        <div className="mt-8 space-y-3">
          {STEPS.filter(s => s.key !== 'done').map((step, i) => {
            const isDone = i < currentStepIndex;
            const isCurrent = step.key === currentStep;
            return (
              <div key={step.key} className="flex items-center gap-3">
                {isDone ? (
                  <span className="text-[--color-success] text-sm">&#10003;</span>
                ) : isCurrent ? (
                  <span className="w-4 h-4 border-2 border-[--color-accent] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="w-4 h-4 border-2 border-[--color-border] rounded-full" />
                )}
                <span className={`text-sm ${isDone ? 'text-[--color-text-faint]' : isCurrent ? 'text-[--color-text-primary] font-medium' : 'text-[--color-text-disabled]'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {detectedLang && (
          <div className="mt-6">
            <LanguageConfirm
              detectedLanguage={detectedLang}
              onConfirm={(lang) => {
                setDetectedLang(lang);
                dispatch({ type: 'SET_DETECTED_LANGUAGE', language: lang });
              }}
            />
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-[--color-error-surface] rounded-xl text-[--color-error-text] text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
