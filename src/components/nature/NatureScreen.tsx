import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  Moon,
  ChevronLeft,
  Heart,
  RotateCcw,
  TreePine,
  CheckCircle2,
} from 'lucide-react';
import { NATURE_ENVIRONMENTS } from '../../data/sanctuaryContent';
import { NatureEnvironmentId, NatureEnvironment } from '../../types';
import { NatureVisual } from './NatureVisual';
import { soundEngine, AudioEngineState } from '../../services/soundEngine';
import { storageService } from '../../services/storage';

interface NatureScreenProps {
  initialEnvironmentId?: NatureEnvironmentId;
  onBackToHome?: () => void;
}

export const NatureScreen: React.FC<NatureScreenProps> = ({
  initialEnvironmentId = 'forest',
  onBackToHome,
}) => {
  const [selectedEnvId, setSelectedEnvId] = useState<NatureEnvironmentId>(initialEnvironmentId);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(10); // minutes
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState<number | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [engineState, setEngineState] = useState<AudioEngineState>(soundEngine.getState());
  const [favorites, setFavorites] = useState<NatureEnvironmentId[]>(
    storageService.getPreferences().favoriteEnvironmentIds
  );

  useEffect(() => {
    return soundEngine.subscribe((state) => {
      setEngineState(state);
    });
  }, []);

  const currentEnv =
    NATURE_ENVIRONMENTS.find((e) => e.id === selectedEnvId) || NATURE_ENVIRONMENTS[0];

  const isCurrentPlaying =
    engineState.isPlayingNature && engineState.currentNatureId === currentEnv.id;

  const isFavorite = favorites.includes(currentEnv.id);

  // Session timer countdown
  useEffect(() => {
    let interval: number | null = null;
    if (isSessionActive && sessionSecondsRemaining !== null && sessionSecondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSessionSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, sessionSecondsRemaining]);

  const handleTogglePlay = () => {
    if (isCurrentPlaying) {
      soundEngine.stopNature();
      setIsSessionActive(false);
    } else {
      soundEngine.playNature(currentEnv.id);
      setIsSessionActive(true);
      if (sessionSecondsRemaining === null) {
        setSessionSecondsRemaining(selectedDuration * 60);
      }
    }
  };

  const handleStartSession = (durationMinutes: number) => {
    setSelectedDuration(durationMinutes);
    setSessionSecondsRemaining(durationMinutes * 60);
    setIsSessionActive(true);
    setIsCompleted(false);
    soundEngine.playNature(currentEnv.id);
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    setSessionSecondsRemaining(selectedDuration * 60);
    soundEngine.stopNature();
  };

  const handleCompleteSession = () => {
    setIsSessionActive(false);
    setIsCompleted(true);
    soundEngine.playSingingBowlChime(216);
    storageService.addSessionHistory({
      title: `${currentEnv.name} Immersion`,
      type: 'nature',
      durationSeconds: selectedDuration * 60,
    });
  };

  const handleToggleFavorite = () => {
    storageService.toggleFavoriteEnvironment(currentEnv.id);
    setFavorites(storageService.getPreferences().favoriteEnvironmentIds);
  };

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return `${selectedDuration}:00`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`pb-28 sm:pb-20 max-w-4xl mx-auto px-4 space-y-5 ${isImmersiveMode ? 'fixed inset-0 z-50 p-0 bg-black' : ''}`}>
      {/* Top Header / Back navigation (Hidden in Immersive Mode) */}
      {!isImmersiveMode && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="p-1.5 rounded-xl text-[#827666] hover:text-[#244C3A]"
                aria-label="Back to home"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="font-serif text-2xl font-medium text-[#244C3A]">
                Nature Immersion
              </h1>
              <p className="text-xs text-[#827666]">
                Four peaceful natural world environments.
              </p>
            </div>
          </div>

          {/* Environment Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {NATURE_ENVIRONMENTS.map((env) => {
              const isSelected = selectedEnvId === env.id;
              return (
                <button
                  key={env.id}
                  onClick={() => {
                    setSelectedEnvId(env.id);
                    if (isCurrentPlaying) {
                      soundEngine.playNature(env.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-[#244C3A] text-[#F7F5EE]'
                      : 'bg-[#EDE9DC]/70 hover:bg-[#EDE9DC] text-[#27332C]'
                  }`}
                >
                  {env.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Large-Format Atmospheric Visual Portal */}
      <section
        className={`relative rounded-3xl overflow-hidden shadow-lg border border-[#91A88C]/30 transition-all duration-500 ${
          isImmersiveMode
            ? 'w-full h-full rounded-none border-none'
            : 'h-[360px] sm:h-[420px]'
        }`}
      >
        <NatureVisual environmentId={currentEnv.id} className="w-full h-full" />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Controls on Visual */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isFavorite
                ? 'bg-rose-500/80 text-white'
                : 'bg-black/30 text-white/80 hover:bg-black/50'
            }`}
            title="Favorite environment"
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImmersiveMode(!isImmersiveMode)}
              className="px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 text-xs backdrop-blur-md flex items-center gap-1.5 transition-colors"
              title="Toggle immersive view"
            >
              {isImmersiveMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isImmersiveMode ? 'Exit' : 'Immersive'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Floating Environment Title & Playback Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 text-white space-y-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#91A88C]">
              Sanctuary Atmosphere
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight drop-shadow-sm">
              {currentEnv.name}
            </h2>
            <p className="text-xs text-white/85 font-light line-clamp-1 max-w-md">
              {currentEnv.atmosphere}
            </p>
          </div>

          {/* Integrated On-Visual Controls */}
          <div className="pt-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="w-12 h-12 rounded-full bg-[#EDE9DC] text-[#244C3A] flex items-center justify-center hover:bg-white shadow-xl transition-transform active:scale-95"
                aria-label={isCurrentPlaying ? 'Pause sound' : 'Play sound'}
              >
                {isCurrentPlaying ? (
                  <Pause size={20} fill="#244C3A" />
                ) : (
                  <Play size={20} fill="#244C3A" className="ml-0.5" />
                )}
              </button>

              <div className="text-xs">
                <span className="font-medium">
                  {isCurrentPlaying ? 'Ambience active' : 'Touch to listen'}
                </span>
                <p className="text-[10px] text-white/70">
                  {formatTimer(sessionSecondsRemaining)} • Procedural sound
                </p>
              </div>
            </div>

            {/* Volume Quick Slider */}
            <div className="hidden sm:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
              <Volume2 size={14} className="text-white/80" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={engineState.natureVolume}
                onChange={(e) => soundEngine.setNatureVolume(parseFloat(e.target.value))}
                className="w-20 accent-[#EDE9DC] h-1.5 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Duration Selector & Controls (When not in immersive mode) */}
      {!isImmersiveMode && (
        <div className="p-5 rounded-3xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-serif text-sm font-medium text-[#244C3A]">
              Session Duration
            </span>
            <span className="text-xs text-[#827666] font-mono">
              {formatTimer(sessionSecondsRemaining)}
            </span>
          </div>

          {/* 2, 5, 10, 20 Minutes Selector */}
          <div className="grid grid-cols-4 gap-2">
            {currentEnv.durationOptions.map((mins) => {
              const isSelected = selectedDuration === mins;
              return (
                <button
                  key={mins}
                  onClick={() => handleStartSession(mins)}
                  className={`py-2 px-3 rounded-2xl border text-center font-medium text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#244C3A] text-[#F7F5EE] border-[#244C3A]'
                      : 'bg-white/80 text-[#27332C] border-[#91A88C]/30 hover:bg-white'
                  }`}
                >
                  {mins} min
                </button>
              );
            })}
          </div>

          <p className="text-xs text-[#827666] leading-relaxed italic">
            "{currentEnv.poeticDescription}"
          </p>
        </div>
      )}

      {/* Session Completion Celebration Banner */}
      {isCompleted && (
        <div className="p-5 rounded-3xl bg-[#244C3A] text-[#F7F5EE] space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#91A88C]" />
            <h3 className="font-serif text-base font-normal">
              Take this quiet moment with you.
            </h3>
          </div>
          <p className="text-xs text-[#EDE9DC]/90">
            You completed {selectedDuration} minutes of peaceful nature immersion.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="px-4 py-2 rounded-full bg-[#EDE9DC] text-[#244C3A] text-xs font-medium hover:bg-white transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => setIsCompleted(false)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F5EE] border border-white/20 text-xs transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
