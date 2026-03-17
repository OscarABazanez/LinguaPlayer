import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../stores/appStore';
import SettingsPanel from '../settings/SettingsPanel';

export default function TopBar() {
  const { screen, detectedLanguage, nativeLanguage } = useAppState();
  const dispatch = useAppDispatch();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="bg-[--color-surface-glass] backdrop-blur-md border-b border-[--color-border] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {screen !== 'home' && (
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="text-[--color-text-faint] hover:text-[--color-text-secondary] transition-colors"
                aria-label="Go home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold text-[--color-text-primary] tracking-tight">
              LinguaPlayer
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {screen === 'player' && detectedLanguage && (
              <span className="text-sm text-[--color-text-faint]">
                {detectedLanguage.toUpperCase()} → {nativeLanguage.toUpperCase()}
              </span>
            )}
            {screen === 'player' && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg text-[--color-text-faint] hover:text-[--color-text-secondary] hover:bg-[--color-hover] transition-colors"
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
