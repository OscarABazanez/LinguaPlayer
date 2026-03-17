import { useLearningModes } from '../../hooks/useLearningModes';
import { useAppState, useAppDispatch } from '../../stores/appStore';

interface Props {
  onClose: () => void;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative rounded-full transition-colors shrink-0"
      style={{
        width: 44,
        height: 24,
        backgroundColor: enabled ? 'var(--color-accent)' : 'var(--color-toggle-off)',
        border: enabled ? '2px solid var(--color-accent)' : '2px solid var(--color-border-strong)',
      }}
    >
      <span
        className="absolute rounded-full shadow-md transition-transform duration-200"
        style={{
          width: 18,
          height: 18,
          top: 1,
          left: 1,
          transform: enabled ? 'translateX(20px)' : 'translateX(0px)',
          backgroundColor: enabled ? '#ffffff' : 'var(--color-text-muted)',
        }}
      />
    </button>
  );
}

export default function SettingsPanel({ onClose }: Props) {
  const modes = useLearningModes();
  const { darkMode } = useAppState();
  const dispatch = useAppDispatch();

  const toggles = [
    { key: 'dualSubtitles' as const, label: 'Dual subtitles', desc: 'Show translation below original' },
    { key: 'grammarColors' as const, label: 'Grammar colors', desc: 'Color words by part of speech' },
    { key: 'autoPause' as const, label: 'Auto-pause', desc: 'Pause after each sentence' },
    { key: 'autoLoop' as const, label: 'Auto-loop', desc: 'Repeat current sentence' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="rounded-2xl w-[calc(100vw-2rem)] sm:w-80 max-w-sm p-4 sm:p-6 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1.5px solid var(--color-border-strong)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[--color-text-primary]">Settings</h3>
          <button onClick={onClose} className="text-[--color-text-faint] hover:text-[--color-text-secondary] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="divide-y divide-[--color-border]">
          {/* Dark mode toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[--color-text-muted]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[--color-text-primary]">Modo nocturno</p>
                <p className="text-xs text-[--color-text-faint]">Colores optimizados para lectura</p>
              </div>
            </div>
            <Toggle
              enabled={darkMode}
              onToggle={() => dispatch({ type: 'SET_DARK_MODE', darkMode: !darkMode })}
            />
          </div>

          {toggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-[--color-text-primary]">{t.label}</p>
                <p className="text-xs text-[--color-text-faint]">{t.desc}</p>
              </div>
              <Toggle
                enabled={modes[t.key]}
                onToggle={() => modes.toggle(t.key)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
