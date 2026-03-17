import type { Segment, Word } from '../../types/subtitle';
import SidebarTabs from './SidebarTabs';
import ScriptTab from './ScriptTab';
import VocabTab from './VocabTab';
import GrammarTab from './GrammarTab';

type TabKey = 'script' | 'vocab' | 'grammar';

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
      </div>
    </div>
  );
}
