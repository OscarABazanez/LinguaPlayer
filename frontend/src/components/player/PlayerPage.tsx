import { useState } from 'react';
import { useAppState } from '../../stores/appStore';
import { saveWordLookup } from '../../services/supabaseService';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { useSubtitleSync } from '../../hooks/useSubtitleSync';
import { useLearningModes } from '../../hooks/useLearningModes';
import { useGrammarCoach } from '../../hooks/useGrammarCoach';
import { useSegmentLoop } from '../../hooks/useSegmentLoop';
import { useActiveWord } from '../../hooks/useActiveWord';
import { useVideoGestures } from '../../hooks/useVideoGestures';
import { usePronunciationPractice } from '../../hooks/usePronunciationPractice';
import VideoPlayer from './VideoPlayer';
import PlayerControls from './PlayerControls';
import ProgressSeekBar from './ProgressSeekBar';
import SubtitleOverlay from './SubtitleOverlay';
import Sidebar from '../sidebar/Sidebar';
import GrammarPopup from '../popup/GrammarPopup';
import type { Word } from '../../types/subtitle';
import type { TabKey } from '../sidebar/SidebarTabs';

export default function PlayerPage() {
  const { videoSource, segments, detectedLanguage, nativeLanguage, supabaseVideoId } = useAppState();
  const player = useVideoPlayer();
  const { activeSegmentIndex, activeSegment } = useSubtitleSync(segments, player.currentTime);
  const modes = useLearningModes();
  const grammar = useGrammarCoach();
  useSegmentLoop({
    currentTime: player.currentTime,
    activeSegment,
    isPlaying: player.isPlaying,
    autoLoop: modes.autoLoop,
    autoPause: modes.autoPause,
    seek: player.seek,
    pause: player.pause,
  });

  const activeWordIndex = useActiveWord(activeSegment?.words, player.currentTime);
  const pronunciation = usePronunciationPractice();

  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('script');
  const [showGrammarPopup, setShowGrammarPopup] = useState(false);

  const handleWordClick = (word: Word) => {
    player.pause();
    setSelectedWord(word);

    // Save word lookup to Supabase
    if (supabaseVideoId && activeSegment) {
      saveWordLookup(
        supabaseVideoId,
        word.cleanWord,
        activeSegment.text,
        activeSegmentIndex,
      ).catch(() => { /* silent fail */ });
    }
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
  };

  const handleSkipCaption = (direction: 1 | -1) => {
    const targetIndex = Math.max(0, Math.min(activeSegmentIndex + direction, segments.length - 1));
    if (segments[targetIndex]) {
      player.seek(segments[targetIndex].start);
    }
  };

  // Video gesture controls (tap, double-tap, long press)
  const gestures = useVideoGestures({
    onSingleTap: player.togglePlay,
    onDoubleTapLeft: () => handleSkipCaption(-1),
    onDoubleTapRight: () => handleSkipCaption(1),
    onLongPress: () => modes.toggle('autoLoop'),
  });

  const handleGrammarCoach = () => {
    if (!activeSegment) return;
    player.pause();
    grammar.explain(activeSegment.text, detectedLanguage, nativeLanguage);
    setShowGrammarPopup(true);
    setActiveTab('grammar');
  };

  const handleMicStart = () => {
    if (!activeSegment) return;
    player.pause();
    pronunciation.startPractice(activeSegment.text, detectedLanguage, nativeLanguage);
    setActiveTab('practice');
  };

  const handleMicStop = () => {
    pronunciation.stopPractice();
  };

  const handleRequestTips = () => {
    pronunciation.requestTips(nativeLanguage);
  };

  const videoSrc = videoSource?.type === 'file' ? videoSource.objectUrl : undefined;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
        {/* Video + Controls + Subtitles */}
        <div className="flex-1 min-w-0">
          <div className="bg-black rounded-xl overflow-hidden">
            <VideoPlayer
              src={videoSrc}
              videoRef={player.videoRef}
              onLoadedMetadata={player.handleLoadedMetadata}
              onPlay={player.handlePlay}
              onPause={player.handlePause}
              onEnded={player.handleEnded}
              gestureHandlers={gestures.handlers}
              activeGesture={gestures.activeGesture}
              isPlaying={player.isPlaying}
            />
          </div>

          {/* Subtitles below video */}
          <SubtitleOverlay
            segment={activeSegment}
            showTranslation={modes.dualSubtitles}
            showGrammarColors={modes.grammarColors}
            onWordClick={handleWordClick}
            selectedWord={selectedWord}
            onClosePopup={handleClosePopup}
            detectedLanguage={detectedLanguage}
            nativeLanguage={nativeLanguage}
            activeWordIndex={activeWordIndex}
          />

          {/* Controls with Grammar Popup anchored above */}
          <div className="relative">
            {showGrammarPopup && (grammar.explanation || grammar.loading || grammar.error) && (
              <GrammarPopup
                explanation={grammar.explanation}
                loading={grammar.loading}
                error={grammar.error}
                sentence={grammar.sentence}
                onClose={() => setShowGrammarPopup(false)}
              />
            )}
            <PlayerControls
            isPlaying={player.isPlaying}
            playbackRate={player.playbackRate}
            autoLoop={modes.autoLoop}
            onTogglePlay={player.togglePlay}
            onSkipCaption={handleSkipCaption}
            onToggleLoop={() => modes.toggle('autoLoop')}
            onSetSpeed={player.setPlaybackRate}
            onGrammarCoach={handleGrammarCoach}
            grammarLoading={grammar.loading}
            pronunciationState={pronunciation.state}
            onMicStart={handleMicStart}
            onMicStop={handleMicStop}
          />
          </div>

          {/* Seek bar */}
          <ProgressSeekBar
            currentTime={player.currentTime}
            duration={player.duration}
            onSeek={player.seek}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[380px] flex-shrink-0 mt-2 lg:mt-0">
          <Sidebar
            segments={segments}
            activeSegmentIndex={activeSegmentIndex}
            onSegmentClick={(seg) => player.seek(seg.start)}
            onWordClick={handleWordClick}
            detectedLanguage={detectedLanguage}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            grammarExplanation={grammar.explanation}
            grammarLoading={grammar.loading}
            grammarError={grammar.error}
            grammarSentence={grammar.sentence}
            activeSegmentText={activeSegment?.text ?? null}
            pronunciationState={pronunciation.state}
            pronunciationResult={pronunciation.result}
            pronunciationError={pronunciation.error}
            pronunciationTips={pronunciation.pronunciationTips}
            tipsLoading={pronunciation.tipsLoading}
            audioUrl={pronunciation.audioUrl}
            onPronunciationStart={handleMicStart}
            onPronunciationStop={handleMicStop}
            onPronunciationSubmit={pronunciation.submitRecording}
            onPronunciationReset={pronunciation.reset}
            onRequestTips={handleRequestTips}
          />
        </div>
      </div>
    </div>
  );
}
