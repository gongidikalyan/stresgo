import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { YOGA_ROUTINES } from '../../data/sanctuaryContent';
import { YogaRoutine } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { storageService } from '../../services/storage';

interface YogaScreenProps {
  onBackToHome?: () => void;
}

export const YogaScreen: React.FC<YogaScreenProps> = ({ onBackToHome }) => {
  const [selectedRoutine, setSelectedRoutine] = useState<YogaRoutine>(YOGA_ROUTINES[0]);
  const [isActiveSession, setIsActiveSession] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [poseSecondsRemaining, setPoseSecondsRemaining] = useState<number>(
    selectedRoutine.poses[0].durationSeconds
  );
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsActiveSession(false);
    setIsPaused(false);
    setCurrentPoseIndex(0);
    setPoseSecondsRemaining(selectedRoutine.poses[0].durationSeconds);
    setIsCompleted(false);
  }, [selectedRoutine.id]);

  // Pose countdown timer
  useEffect(() => {
    let interval: number | null = null;
    if (isActiveSession && !isPaused && poseSecondsRemaining > 0) {
      interval = window.setInterval(() => {
        setPoseSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleAdvancePose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActiveSession, isPaused, poseSecondsRemaining]);

  const handleAdvancePose = () => {
    soundEngine.playBreathChime(false);
    if (currentPoseIndex < selectedRoutine.poses.length - 1) {
      const nextIdx = currentPoseIndex + 1;
      setCurrentPoseIndex(nextIdx);
      setPoseSecondsRemaining(selectedRoutine.poses[nextIdx].durationSeconds);
    } else {
      setIsActiveSession(false);
      setIsCompleted(true);
      soundEngine.playSingingBowlChime(216);
      storageService.addSessionHistory({
        title: selectedRoutine.title,
        type: 'yoga',
        durationSeconds: selectedRoutine.durationMinutes * 60,
      });
    }
  };

  const handleStartPractice = () => {
    setIsActiveSession(true);
    setIsPaused(false);
    setIsCompleted(false);
    soundEngine.playSingingBowlChime(216);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActiveSession(false);
    setIsPaused(false);
    setCurrentPoseIndex(0);
    setPoseSecondsRemaining(selectedRoutine.poses[0].durationSeconds);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentPose = selectedRoutine.poses[currentPoseIndex];

  return (
    <div className="pb-28 sm:pb-20 max-w-4xl mx-auto px-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-xl text-[#827666] hover:text-[#244C3A]"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="font-serif text-2xl font-medium text-[#244C3A]">
              Gentle Yoga & Movement
            </h1>
            <p className="text-xs text-[#827666]">
              Beginner-friendly poses and restorative stretching without pressure.
            </p>
          </div>
        </div>
      </div>

      {/* Routine Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {YOGA_ROUTINES.map((routine) => {
          const isSelected = selectedRoutine.id === routine.id;
          return (
            <button
              key={routine.id}
              onClick={() => setSelectedRoutine(routine)}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-[#244C3A] text-[#F7F5EE]'
                  : 'bg-[#EDE9DC]/70 hover:bg-[#EDE9DC] text-[#27332C]'
              }`}
            >
              {routine.title}
            </button>
          );
        })}
      </div>

      {/* Active Routine Card / Guided Practice View */}
      <div className="rounded-3xl bg-white border border-[#91A88C]/30 shadow-sm overflow-hidden p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] uppercase font-semibold text-[#91A88C]">
                {selectedRoutine.level}
              </span>
              <span className="text-[#827666]">•</span>
              <span className="text-[#827666] font-mono">
                {selectedRoutine.durationMinutes} Minutes
              </span>
            </div>
            <h2 className="font-serif text-2xl font-medium text-[#244C3A] mt-1">
              {selectedRoutine.title}
            </h2>
            <p className="text-xs text-[#827666] mt-1 leading-relaxed max-w-lg">
              {selectedRoutine.description}
            </p>
          </div>

          {!isActiveSession && (
            <button
              onClick={handleStartPractice}
              className="px-5 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-md flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <Play size={13} fill="#F7F5EE" />
              <span>Begin Routine</span>
            </button>
          )}
        </div>

        {/* Safety Note */}
        <div className="p-3 rounded-2xl bg-[#EDE9DC]/40 border border-[#91A88C]/20 flex items-start gap-2.5 text-xs text-[#827666]">
          <ShieldCheck size={16} className="text-[#244C3A] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-medium text-[#244C3A]">Gentle Practice Reminder: </span>
            {selectedRoutine.safetyNote}
          </p>
        </div>

        {/* Active Practice Live Viewport */}
        {isActiveSession && (
          <div className="p-6 rounded-2xl bg-[#EDE9DC]/60 border border-[#91A88C]/40 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#91A88C]">
                Movement {currentPoseIndex + 1} of {selectedRoutine.poses.length}
              </span>
              <span className="font-mono text-base font-medium text-[#244C3A]">
                {formatTimer(poseSecondsRemaining)}
              </span>
            </div>

            <div className="space-y-1 text-center py-2">
              <h3 className="font-serif text-2xl font-medium text-[#244C3A]">
                {currentPose.name}
              </h3>
              {currentPose.sanskritName && (
                <p className="text-xs text-[#827666] italic">
                  {currentPose.sanskritName}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white/80 border border-[#91A88C]/20 space-y-2 text-xs">
              <p className="text-[#27332C] leading-relaxed">
                {currentPose.instruction}
              </p>
              <p className="text-[#827666] text-[11px] font-medium pt-1 border-t border-[#91A88C]/15">
                Benefit: {currentPose.benefit}
              </p>
            </div>

            {/* Practice Step Bar */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {selectedRoutine.poses.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentPoseIndex
                      ? 'w-8 bg-[#244C3A]'
                      : i < currentPoseIndex
                      ? 'w-3 bg-[#91A88C]'
                      : 'w-3 bg-[#91A88C]/30'
                  }`}
                />
              ))}
            </div>

            {/* In-Session Controls */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleTogglePause}
                className="px-5 py-2 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-sm flex items-center gap-1.5"
              >
                {isPaused ? <Play size={13} fill="#F7F5EE" /> : <Pause size={13} />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={handleAdvancePose}
                className="px-4 py-2 rounded-full border border-[#244C3A] text-[#244C3A] hover:bg-[#EDE9DC] text-xs font-medium flex items-center gap-1"
              >
                <span>Next Pose</span>
                <ChevronRight size={13} />
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-full bg-[#EDE9DC] hover:bg-[#91A88C]/30 text-[#827666]"
                title="Reset session"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Pose Sequence List Preview */}
        {!isActiveSession && (
          <div className="space-y-2 pt-2">
            <h3 className="font-serif text-sm font-medium text-[#244C3A]">
              Sequence of Movements
            </h3>

            <div className="divide-y divide-[#91A88C]/20 border border-[#91A88C]/20 rounded-2xl overflow-hidden bg-white/70">
              {selectedRoutine.poses.map((pose, idx) => (
                <div key={idx} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#EDE9DC] text-[#244C3A] flex items-center justify-center font-mono text-[10px] shrink-0 font-medium">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#27332C]">
                          {pose.name}
                        </span>
                        {pose.sanskritName && (
                          <span className="text-[11px] text-[#827666] italic">
                            ({pose.sanskritName})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#827666] mt-0.5">
                        {pose.instruction}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#827666] shrink-0">
                    {pose.durationSeconds}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Celebration */}
      {isCompleted && (
        <div className="p-5 rounded-3xl bg-[#244C3A] text-[#F7F5EE] space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#91A88C]" />
            <h3 className="font-serif text-base font-normal">
              Take this quiet moment with you.
            </h3>
          </div>
          <p className="text-xs text-[#EDE9DC]/90">
            You completed {selectedRoutine.title}. Notice the gentle space in your body.
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
              Practice Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
