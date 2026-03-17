type TabKey = 'script' | 'vocab' | 'grammar';

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'script', label: 'Script', icon: '📜' },
  { key: 'vocab', label: 'Vocab', icon: '📚' },
  { key: 'grammar', label: 'Grammar', icon: '📖' },
];

export default function SidebarTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex border-b border-[--color-border]">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
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
