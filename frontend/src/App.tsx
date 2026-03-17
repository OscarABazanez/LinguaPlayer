import { useReducer, useEffect } from 'react';
import { appReducer, initialState, AppStateContext, AppDispatchContext } from './stores/appStore';
import AppLayout from './components/layout/AppLayout';
import HomePage from './components/home/HomePage';
import ProcessingPage from './components/processing/ProcessingPage';
import PlayerPage from './components/player/PlayerPage';

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        <AppLayout>
          {state.screen === 'home' && <HomePage />}
          {state.screen === 'processing' && <ProcessingPage />}
          {state.screen === 'player' && <PlayerPage />}
        </AppLayout>
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export default App;
