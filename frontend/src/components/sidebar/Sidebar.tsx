import type { Segment, Word } from '../../types/subtitle';
import type { TabKey } from './SidebarTabs';
import type { PracticeState } from '../../hooks/usePronunciationPractice';
import type { PronunciationResult } from '../../types/pronunciation';
import SidebarTabs from './SidebarTabs';
import ScriptTab from './ScriptTab';
import VocabTab from './VocabTab';
import GrammarTab from './GrammarTab';
import PronunciationPanel from '../pronunciation/PronunciationPanel';

interface Props {
  segments: Segment[];
  activeSegmentIndex: number;
  onSegmentClick: (segment: Segment) => void;
  onWordClick: (word: Word) => void;
  detectedLanguage: string;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  grammarExplanation: string;
  grammarLoading: boolean;
  grammarError: string | null;
  grammarSentence: string | null;
  // Pronunciation
  activeSegmentText: string | null;
  pronunciationState: PracticeState;
  pronunciationResult: PronunciationResult | null;
  pronunciationError: string | null;
  pronunciationTips: string;
  tipsLoading: boolean;
  audioUrl: string | null;
  onPronunciationStart: () => void;
  onPronunciationStop: () => void;
  onPronunciationSubmit: () => void;
  onPronunciationReset: () => void;
  onRequestTips: () => void;
}

export default function Sidebar({
  segments,
  activeSegmentIndex,
  onSegmentClick,
  activeTab,
  onTabChange,
  grammarExplanation,
  grammarLoading,
  grammarError,
  grammarSentence,
  activeSegmentText,
  pronunciationState,
  pronunciationResult,
  pronunciationError,
  pronunciationTips,
  tipsLoading,
  audioUrl,
  onPronunciationStart,
  onPronunciationStop,
  onPronunciationSubmit,
  onPronunciationReset,
  onRequestTips,
}: Props) {
  return (
    <div className="bg-[--color-surface] rounded-xl border border-[--color-border] shadow-sm overflow-hidden h-[50vh] lg:h-[calc(100vh-7rem)]">
      <SidebarTabs activeTab={activeTab} onTabChange={onTabChange} />
      <div className="overflow-y-auto h-[calc(100%-3rem)]">
        {activeTab === 'script' && (
          <ScriptTab
            segments={segments}
            activeSegmentIndex={activeSegmentIndex}
            onSegmentClick={onSegmentClick}
          />
        )}
        {activeTab === 'vocab' && <VocabTab />}
        {activeTab === 'grammar' && (
          <GrammarTab
            explanation={grammarExplanation}
            loading={grammarLoading}
            error={grammarError}
            sentence={grammarSentence}
          />
        )}
        {activeTab === 'practice' && (
          <PronunciationPanel
            segmentText={activeSegmentText}
            state={pronunciationState}
            result={pronunciationResult}
            error={pronunciationError}
            pronunciationTips={pronunciationTips}
            tipsLoading={tipsLoading}
            audioUrl={audioUrl}
            onStart={onPronunciationStart}
            onStop={onPronunciationStop}
            onSubmit={onPronunciationSubmit}
            onReset={onPronunciationReset}
            onRequestTips={onRequestTips}
          />
        )}
      </div>
    </div>
  );
}
