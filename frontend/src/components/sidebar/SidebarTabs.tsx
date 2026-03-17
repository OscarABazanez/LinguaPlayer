export type TabKey = 'script' | 'vocab' | 'grammar' | 'practice';

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'script', label: 'Script' },
  { key: 'vocab', label: 'Vocab' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'practice', label: 'Practice' },
];

export default function SidebarTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex border-b border-[--color-border]">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-medium text-center transition-colors ${
            activeTab === tab.key
              ? 'text-[--color-text-primary] border-b-2 border-[--color-text-primary]'
              : 'text-[--color-text-faint] hover:text-[--color-text-secondary]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
