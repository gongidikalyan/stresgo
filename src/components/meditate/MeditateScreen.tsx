import React, { useState, useEffect } from 'react';
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  Bell,
  CheckCircle2,
  Send,
  BookOpen,
} from 'lucide-react';
import { MEDITATION_PRACTICES } from '../../data/sanctuaryContent';
import {
  MeditationPracticeId,
  StressToolId,
} from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { storageService } from '../../services/storage';

interface MeditateScreenProps {
  initialPracticeId?: MeditationPracticeId;
  onBackToHome?: () => void;
  onOpenStressTools?: (toolId?: StressToolId) => void;
}

export const MeditateScreen: React.FC<MeditateScreenProps> = ({
  initialPracticeId = 'three_minute_breath',
  onBackToHome,
}) => {
  const [selectedPracticeId, setSelectedPracticeId] = useState<MeditationPracticeId>(initialPracticeId);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180);

  // Breathing cycle
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathText, setBreathText] = useState('Inhale gently');

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  const practice =
    MEDITATION_PRACTICES.find((p) => p.id === selectedPracticeId) ||
    MEDITATION_PRACTICES[1];

  useEffect(() => {
    setIsActive(false);
    setIsCompleted(false);
    setCurrentStepIndex(0);
    setSecondsRemaining(practice.durationMinutes * 60);
    setJournalSaved(false);
  }, [practice.id]);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  useEffect(() => {
    if (!isActive || practice.guidanceStyle !== 'breath_animation') return;

    let timeout: number;
    const runCycle = () => {
      setBreathPhase('inhale');
      setBreathText('Inhale gently');
      soundEngine.playBreathChime(false);

      timeout = window.setTimeout(() => {
        setBreathPhase('hold');
        setBreathText('Rest in stillness');

        timeout = window.setTimeout(() => {
          setBreathPhase('exhale');
          setBreathText('Soft exhale');
          soundEngine.playBreathChime(true);

          timeout = window.setTimeout(() => {
            setBreathPhase('rest');
            setBreathText('Quiet presence');

            timeout = window.setTimeout(runCycle, 2000);
          }, 4000);
        }, 2000);
      }, 4000);
    };

    runCycle();
    return () => clearTimeout(timeout);
  }, [isActive, practice.guidanceStyle]);

  useEffect(() => {
    if (!isActive || !practice.steps || practice.steps.length === 0) return;
    const totalDuration = practice.durationMinutes * 60;
    const elapsed = totalDuration - secondsRemaining;
    let accumulated = 0;

    for (let i = 0; i < practice.steps.length; i++) {
      accumulated += practice.steps[i].durationSeconds;
      if (elapsed < accumulated) {
        setCurrentStepIndex(i);
        break;
      }
    }
  }, [secondsRemaining, isActive, practice]);

  const handleStart = () => {
    setIsActive(true);
    setIsCompleted(false);
    soundEngine.playSingingBowlChime(216);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSecondsRemaining(practice.durationMinutes * 60);
    setCurrentStepIndex(0);
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsCompleted(true);
    soundEngine.playSingingBowlChime(216);

    storageService.addSessionHistory({
      title: practice.title,
      type: 'meditation',
      durationSeconds: practice.durationMinutes * 60,
    });
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    storageService.addJournalEntry('Gratitude Reflection', journalText.trim());
    setJournalSaved(true);
    setJournalText('');
    handleComplete();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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
              Mindfulness Studio
            </h1>
            <p className="text-xs text-[#827666]">
              Unhurried breathing, quiet presence, and spacious meditation.
            </p>
          </div>
        </div>

        <button
          onClick={() => soundEngine.playSingingBowlChime(216)}
          className="p-2 rounded-xl bg-[#EDE9DC]/70 hover:bg-[#EDE9DC] text-[#244C3A] text-xs flex items-center gap-1.5 border border-[#91A88C]/30"
          title="Singing bowl bell chime"
        >
          <Bell size={14} />
          <span className="hidden sm:inline">Singing Bowl</span>
        </button>
      </div>

      {/* Practice Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {MEDITATION_PRACTICES.map((p) => {
          const isSelected = selectedPracticeId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPracticeId(p.id)}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-[#244C3A] text-[#F7F5EE]'
                  : 'bg-[#EDE9DC]/70 hover:bg-[#EDE9DC] text-[#27332C]'
              }`}
            >
              {p.title}
            </button>
          );
        })}
      </div>

      {/* Main Studio Viewport Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#91A88C]/30 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#91A88C]">
            Mindfulness Practice • {practice.durationMinutes} Minutes
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#244C3A]">
            {practice.title}
          </h2>
          <p className="text-xs text-[#827666] max-w-sm mx-auto leading-relaxed">
            {practice.description}
          </p>
        </div>

        {/* 1. Animated Breath Circle Guide */}
        {practice.guidanceStyle === 'breath_animation' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-[#91A88C]/15 transition-transform duration-1000 ease-in-out ${
                  breathPhase === 'inhale' || breathPhase === 'hold' ? 'scale-110' : 'scale-90'
                }`}
              />

              <div
                className={`w-40 h-40 rounded-full border-2 border-[#244C3A] bg-gradient-to-tr from-[#244C3A]/20 to-[#EDE9DC] flex flex-col items-center justify-center text-center transition-all duration-[3500ms] ease-in-out ${
                  isActive
                    ? breathPhase === 'inhale'
                      ? 'scale-125 opacity-100'
                      : breathPhase === 'hold'
                      ? 'scale-125 opacity-90'
                      : 'scale-85 opacity-75'
                    : 'scale-100 opacity-80'
                }`}
              >
                <Wind size={22} className="text-[#244C3A] mb-1" />
                <span className="font-serif text-base font-medium text-[#244C3A]">
                  {isActive ? breathText : 'Start Practice'}
                </span>
                <span className="text-[10px] text-[#827666] mt-0.5">
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#827666] max-w-xs text-center">
              Breathe comfortably at your natural rhythm. Stop or pause anytime.
            </p>
          </div>
        )}

        {/* 2. Step-by-Step Guided Steps (5-min Guided / Body Awareness) */}
        {practice.guidanceStyle === 'gentle_steps' && practice.steps && (
          <div className="max-w-md mx-auto space-y-4 py-2">
            <div className="p-6 rounded-2xl bg-[#EDE9DC]/60 border border-[#91A88C]/30 space-y-2 text-center">
              <span className="text-[10px] text-[#91A88C] font-semibold uppercase tracking-wider">
                Step {currentStepIndex + 1} of {practice.steps.length}
              </span>
              <h3 className="font-serif text-xl font-medium text-[#244C3A]">
                {practice.steps[currentStepIndex].title}
              </h3>
              <p className="text-xs text-[#27332C] leading-relaxed">
                {practice.steps[currentStepIndex].instruction}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {practice.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-[#244C3A]'
                      : 'w-2 bg-[#91A88C]/30'
                  }`}
                />
              ))}
            </div>

            <div className="text-center font-mono text-xs text-[#827666]">
              {formatTimer(secondsRemaining)} remaining
            </div>
          </div>
        )}

        {/* 3. Timer Stillness (1-min Pause) */}
        {practice.guidanceStyle === 'timer_stillness' && (
          <div className="py-4 flex flex-col items-center justify-center space-y-4">
            <div className="w-40 h-40 rounded-full border-2 border-[#91A88C]/40 bg-[#EDE9DC]/40 flex flex-col items-center justify-center shadow-inner">
              <span className="font-mono text-3xl font-light text-[#244C3A]">
                {formatTimer(secondsRemaining)}
              </span>
              <span className="text-[10px] text-[#827666] uppercase tracking-wider mt-1">
                {isActive ? 'In Stillness' : 'Paused'}
              </span>
            </div>

            {practice.steps && (
              <p className="text-xs text-[#27332C] text-center max-w-sm italic leading-relaxed">
                "{practice.steps[Math.min(currentStepIndex, practice.steps.length - 1)].instruction}"
              </p>
            )}
          </div>
        )}

        {/* 4. Gratitude Reflection Journal */}
        {practice.guidanceStyle === 'journal_prompt' && (
          <form onSubmit={handleSaveJournal} className="max-w-md mx-auto space-y-3">
            <textarea
              rows={4}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="What brought you peace or gratitude today? Record a quiet thought..."
              className="w-full p-4 rounded-2xl bg-[#EDE9DC]/40 border border-[#91A88C]/40 text-[#27332C] text-xs focus:outline-none focus:border-[#244C3A] resize-none"
            />

            <div className="flex items-center justify-between text-xs text-[#827666]">
              <span>Saved privately on your device only.</span>
              <button
                type="submit"
                disabled={!journalText.trim()}
                className="px-5 py-2 rounded-full bg-[#244C3A] disabled:opacity-40 hover:bg-[#193629] text-[#F7F5EE] font-medium flex items-center gap-1.5 shadow-sm"
              >
                <span>Save Reflection</span>
                <Send size={12} />
              </button>
            </div>

            {journalSaved && (
              <p className="text-xs text-emerald-800 text-center font-medium">
                Saved to your private sanctuary journal!
              </p>
            )}
          </form>
        )}

        {/* Studio Controls (When not in journal mode) */}
        {practice.guidanceStyle !== 'journal_prompt' && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={isActive ? handlePause : handleStart}
              className="px-6 py-2.5 rounded-full bg-[#244C3A] hover:bg-[#193629] text-[#F7F5EE] text-xs font-medium shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              {isActive ? <Pause size={14} /> : <Play size={14} fill="#F7F5EE" />}
              <span>{isActive ? 'Pause' : 'Begin Practice'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-full bg-[#EDE9DC] hover:bg-[#91A88C]/30 text-[#827666]"
              aria-label="Reset timer"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-5 rounded-3xl bg-[#244C3A] text-[#F7F5EE] flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-[#91A88C]" />
            <div>
              <h3 className="font-serif text-base font-normal">
                Take this quiet moment with you.
              </h3>
              <p className="text-xs text-[#EDE9DC]/90">
                You completed {practice.title}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCompleted(false)}
            className="px-4 py-1.5 rounded-full bg-[#EDE9DC] text-[#244C3A] text-xs font-medium hover:bg-white"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
