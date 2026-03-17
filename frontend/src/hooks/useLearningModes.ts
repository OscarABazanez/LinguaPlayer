import { useAppState, useAppDispatch } from '../stores/appStore';
import type { LearningModes } from '../stores/appStore';

export function useLearningModes() {
  const { learningModes } = useAppState();
  const dispatch = useAppDispatch();

  const toggle = (key: keyof LearningModes) => {
    dispatch({ type: 'SET_LEARNING_MODES', modes: { [key]: !learningModes[key] } });
  };

  const setMode = (modes: Partial<LearningModes>) => {
    dispatch({ type: 'SET_LEARNING_MODES', modes });
  };

  return { ...learningModes, toggle, setMode };
}
