import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sliders,
  Moon,
  ChevronUp,
  ChevronDown,
  TreePine,
  Music,
  Heart,
  X,
} from 'lucide-react';
import { soundEngine, AudioEngineState } from '../../services/soundEngine';
import { NATURE_ENVIRONMENTS, MUSIC_TRACKS } from '../../data/sanctuaryContent';
import { storageService } from '../../services/storage';

export const SharedPlayerBar: React.FC = () => {
  const [engineState, setEngineState] = useState<AudioEngineState>(soundEngine.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(
    storageService.getPreferences().favoriteTrackIds
  );

  useEffect(() => {
    return soundEngine.subscribe((state) => {
      setEngineState(state);
    });
  }, []);

  const activeNature = NATURE_ENVIRONMENTS.find((n) => n.id === engineState.currentNatureId);
  const activeMusic = MUSIC_TRACKS.find((m) => m.id === engineState.currentMusicId);

  const hasActiveAudio = engineState.isPlayingNature || engineState.isPlayingMusic;

  if (!hasActiveAudio && !isExpanded) {
    return null;
  }

  const isFavorite = activeMusic ? favorites.includes(activeMusic.id) : false;

  const handleToggleFavorite = () => {
    if (!activeMusic) return;
    const added = storageService.toggleFavoriteTrack(activeMusic.id);
    setFavorites(storageService.getPreferences().favoriteTrackIds);
  };

  const handleTogglePlayPause = () => {
    if (engineState.isPlayingMusic && engineState.currentMusicId) {
      soundEngine.toggleMusic(engineState.currentMusicId);
    } else if (engineState.isPlayingNature && engineState.currentNatureId) {
      soundEngine.toggleNature(engineState.currentNatureId);
    }
  };

  const formatTimer = (seconds: number | null) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Mini Floating Bar above Bottom Navigation */}
      <aside
        aria-label="Shared audio player"
        className="fixed bottom-14 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#244C3A] text-[#F7F5EE] rounded-2xl shadow-xl border border-[#91A88C]/30 backdrop-blur-md overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
      >
        <div className="p-3 flex items-center justify-between gap-3">
          {/* Track / Ambience Info */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EDE9DC]/15 flex items-center justify-center shrink-0">
              {engineState.isPlayingMusic ? (
                <Music size={17} className="text-[#EDE9DC] animate-pulse" />
              ) : (
                <TreePine size={17} className="text-[#EDE9DC] animate-pulse" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-sm font-medium leading-tight truncate">
                {activeMusic ? activeMusic.title : activeNature ? activeNature.name : 'Sanctuary Resonance'}
              </p>
              <p className="text-[10px] text-[#EDE9DC]/75 leading-tight truncate">
                {activeMusic && activeNature
                  ? `${activeMusic.instrument} + ${activeNature.name}`
                  : activeMusic
                  ? activeMusic.instrument
                  : activeNature
                  ? 'Procedural nature ambience'
                  : 'Playing'}
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {activeMusic && (
              <button
                onClick={handleToggleFavorite}
                className={`p-1.5 rounded-lg transition-colors ${
                  isFavorite ? 'text-rose-400' : 'text-[#EDE9DC]/70 hover:text-white'
                }`}
                title="Favorite"
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}

            <button
              onClick={() => setIsSleepModalOpen(true)}
              className="p-1.5 rounded-lg text-[#EDE9DC]/80 hover:text-white transition-colors relative"
              title="Sleep timer"
            >
              <Moon size={16} />
              {engineState.sleepTimerSeconds && (
                <span className="absolute -top-1 -right-1 bg-[#91A88C] text-[#14261D] text-[9px] font-mono px-1 rounded-full font-bold">
                  {Math.ceil(engineState.sleepTimerSeconds / 60)}m
                </span>
              )}
            </button>

            <button
              onClick={handleTogglePlayPause}
              className="w-8 h-8 rounded-full bg-[#EDE9DC] text-[#244C3A] flex items-center justify-center hover:bg-white transition-transform active:scale-95 shadow-sm"
              aria-label={engineState.isPlayingMusic || engineState.isPlayingNature ? 'Pause' : 'Play'}
            >
              {engineState.isPlayingMusic || engineState.isPlayingNature ? (
                <Pause size={15} fill="#244C3A" />
              ) : (
                <Play size={15} fill="#244C3A" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-[#EDE9DC]/70 hover:text-white"
              aria-label="Expand mixer"
            >
              {isExpanded ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
            </button>
          </div>
        </div>

        {/* Expanded Dual-Layer Mixer Drawer */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-white/10 space-y-3 bg-[#193629]/95 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[#EDE9DC]/80 pt-1">
              <span className="font-serif text-sm font-medium text-[#EDE9DC]">
                Dual Ambience Mixer
              </span>
              <button
                onClick={() => soundEngine.stopAll()}
                className="text-[11px] text-red-300 hover:text-red-200"
              >
                Stop All
              </button>
            </div>

            {/* Music Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#EDE9DC]/80">
                <span className="flex items-center gap-1.5">
                  <Music size={13} />
                  <span>Music / Resonance</span>
                </span>
                <span className="font-mono">{Math.round(engineState.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={engineState.musicVolume}
                onChange={(e) => soundEngine.setMusicVolume(parseFloat(e.target.value))}
                className="w-full accent-[#EDE9DC] h-1.5 bg-black/30 rounded-lg cursor-pointer"
              />
            </div>

            {/* Nature Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#EDE9DC]/80">
                <span className="flex items-center gap-1.5">
                  <TreePine size={13} />
                  <span>Nature Ambience</span>
                </span>
                <span className="font-mono">{Math.round(engineState.natureVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={engineState.natureVolume}
                onChange={(e) => soundEngine.setNatureVolume(parseFloat(e.target.value))}
                className="w-full accent-[#EDE9DC] h-1.5 bg-black/30 rounded-lg cursor-pointer"
              />
            </div>

            {/* Master Volume Slider */}
            <div className="space-y-1 pt-1 border-t border-white/10">
              <div className="flex justify-between text-[11px] text-[#EDE9DC]/80">
                <span className="flex items-center gap-1.5">
                  <Sliders size={13} />
                  <span>Master Volume</span>
                </span>
                <span className="font-mono">{Math.round(engineState.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={engineState.masterVolume}
                onChange={(e) => soundEngine.setMasterVolume(parseFloat(e.target.value))}
                className="w-full accent-[#EDE9DC] h-1.5 bg-black/30 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </aside>

      {/* Sleep Timer Modal */}
      {isSleepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-xs bg-[#F7F5EE] rounded-3xl p-5 border border-[#91A88C]/30 shadow-2xl text-[#27332C] space-y-4"
            role="dialog"
            aria-labelledby="sleep-timer-title"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon size={18} className="text-[#244C3A]" />
                <h3 id="sleep-timer-title" className="font-serif text-base font-medium text-[#244C3A]">
                  Sleep Timer
                </h3>
              </div>
              <button
                onClick={() => setIsSleepModalOpen(false)}
                className="p-1 text-[#827666] hover:text-[#27332C]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#827666]">
              Audio will gently fade out over the last 20 seconds.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[5, 10, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    soundEngine.setSleepTimer(mins);
                    setIsSleepModalOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-xl border border-[#91A88C]/30 hover:border-[#244C3A] hover:bg-[#EDE9DC] text-center font-medium transition-colors"
                >
                  {mins} Minutes
                </button>
              ))}
            </div>

            {engineState.sleepTimerSeconds && (
              <button
                onClick={() => {
                  soundEngine.clearSleepTimer();
                  setIsSleepModalOpen(false);
                }}
                className="w-full py-2 rounded-xl text-xs text-red-700 bg-red-50 hover:bg-red-100 font-medium"
              >
                Cancel Timer ({formatTimer(engineState.sleepTimerSeconds)})
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
