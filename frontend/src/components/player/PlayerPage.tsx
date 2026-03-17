import { useState } from 'react';
import { useAppState } from '../../stores/appStore';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { useSubtitleSync } from '../../hooks/useSubtitleSync';
import { useLearningModes } from '../../hooks/useLearningModes';
import { useGrammarCoach } from '../../hooks/useGrammarCoach';
import { useSegmentLoop } from '../../hooks/useSegmentLoop';
import { useActiveWord } from '../../hooks/useActiveWord';
import { useVideoGestures } from '../../hooks/useVideoGestures';
import VideoPlayer from './VideoPlayer';
import PlayerControls from './PlayerControls';
import ProgressSeekBar from './ProgressSeekBar';
import SubtitleOverlay from './SubtitleOverlay';
import Sidebar from '../sidebar/Sidebar';
import GrammarPopup from '../popup/GrammarPopup';
import type { Word } from '../../types/subtitle';

export default function PlayerPage() {
  const { videoSource, segments, detectedLanguage, nativeLanguage } = useAppState();
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

  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'vocab' | 'grammar'>('script');
  const [showGrammarPopup, setShowGrammarPopup] = useState(false);

  const handleWordClick = (word: Word) => {
    player.pause();
    setSelectedWord(word);
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
          />
        </div>
      </div>
    </div>
  );
}
