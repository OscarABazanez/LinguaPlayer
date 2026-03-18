import { createContext, useContext, useReducer, type Dispatch } from 'react';
import type { Segment } from '../types/subtitle';
import type { VideoSource } from '../types/video';
import { DEFAULT_NATIVE_LANGUAGE } from '../utils/constants';

export type AppScreen = 'home' | 'processing' | 'player';

export interface LearningModes {
  autoPause: boolean;
  autoLoop: boolean;
  grammarColors: boolean;
  dualSubtitles: boolean;
}

export interface AppState {
  screen: AppScreen;
  videoSource: VideoSource | null;
  segments: Segment[];
  detectedLanguage: string;
  nativeLanguage: string;
  learningModes: LearningModes;
  darkMode: boolean;
  supabaseVideoId: string | null;
}

const getStoredLang = () => {
  try {
    return localStorage.getItem('linguaplayer_native_lang') ?? DEFAULT_NATIVE_LANGUAGE;
  } catch {
    return DEFAULT_NATIVE_LANGUAGE;
  }
};

const getStoredDarkMode = (): boolean => {
  try {
    const stored = localStorage.getItem('linguaplayer_dark_mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

const getStoredModes = (): LearningModes => {
  try {
    const stored = localStorage.getItem('linguaplayer_modes');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { autoPause: false, autoLoop: false, grammarColors: false, dualSubtitles: true };
};

export const initialState: AppState = {
  screen: 'home',
  videoSource: null,
  segments: [],
  detectedLanguage: '',
  nativeLanguage: getStoredLang(),
  learningModes: getStoredModes(),
  darkMode: getStoredDarkMode(),
  supabaseVideoId: null,
};

export type AppAction =
  | { type: 'SET_SCREEN'; screen: AppScreen }
  | { type: 'SET_VIDEO_SOURCE'; source: VideoSource }
  | { type: 'SET_SEGMENTS'; segments: Segment[] }
  | { type: 'SET_DETECTED_LANGUAGE'; language: string }
  | { type: 'SET_NATIVE_LANGUAGE'; language: string }
  | { type: 'SET_LEARNING_MODES'; modes: Partial<LearningModes> }
  | { type: 'UPDATE_SEGMENT_TRANSLATION'; index: number; translation: string }
  | { type: 'SET_DARK_MODE'; darkMode: boolean }
  | { type: 'SET_SUPABASE_VIDEO_ID'; id: string }
  | { type: 'RESET' };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_VIDEO_SOURCE':
      return { ...state, videoSource: action.source };
    case 'SET_SEGMENTS':
      return { ...state, segments: action.segments };
    case 'SET_DETECTED_LANGUAGE':
      return { ...state, detectedLanguage: action.language };
    case 'SET_NATIVE_LANGUAGE':
      localStorage.setItem('linguaplayer_native_lang', action.language);
      return { ...state, nativeLanguage: action.language };
    case 'SET_LEARNING_MODES': {
      const modes = { ...state.learningModes, ...action.modes };
      localStorage.setItem('linguaplayer_modes', JSON.stringify(modes));
      return { ...state, learningModes: modes };
    }
    case 'UPDATE_SEGMENT_TRANSLATION': {
      const segments = [...state.segments];
      if (segments[action.index]) {
        segments[action.index] = { ...segments[action.index], translation: action.translation };
      }
      return { ...state, segments };
    }
    case 'SET_DARK_MODE':
      localStorage.setItem('linguaplayer_dark_mode', String(action.darkMode));
      return { ...state, darkMode: action.darkMode };
    case 'SET_SUPABASE_VIDEO_ID':
      return { ...state, supabaseVideoId: action.id };
    case 'RESET':
      return { ...initialState, nativeLanguage: state.nativeLanguage, learningModes: state.learningModes, darkMode: state.darkMode };
    default:
      return state;
  }
}

export const AppStateContext = createContext<AppState>(initialState);
export const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}

export { useReducer };
