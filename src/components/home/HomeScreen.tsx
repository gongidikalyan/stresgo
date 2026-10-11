import React, { useState } from 'react';
import {
  Wind,
  ArrowRight,
  Fingerprint,
  Sparkles,
  Square,
  Activity,
  Volume2,
  Clock,
  CheckCircle2,
  Waves,
  Smile,
} from 'lucide-react';
import {
  MEDITATION_PRACTICES,
  MOOD_RECOMMENDATIONS,
  STRESS_TOOLS_CATALOG,
} from '../../data/sanctuaryContent';
import {
  NavigationTab,
  MoodType,
  SessionHistoryItem,
  StressToolId,
  MeditationPracticeId,
} from '../../types';
import { storageService } from '../../services/storage';
import { TeddyStressBuster } from '../stress/TeddyStressBuster';

interface HomeScreenProps {
  onNavigate: (tab: NavigationTab, extraId?: string) => void;
  onOpenSettings: () => void;
  onOpenJournal: () => void;
  onOpenStressTools: (toolId?: StressToolId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenStressTools,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const sessionHistory = storageService.getSessionHistory();
  const lastSession: SessionHistoryItem | undefined = sessionHistory[0];

  const currentMoodRecommendation = selectedMood
    ? MOOD_RECOMMENDATIONS.find((m) => m.mood === selectedMood)
    : null;

  return (
    <div className="space-y-5 pb-28 sm:pb-20 max-w-xl mx-auto px-4">
      {/* 1. App Header Greeting */}
      <section className="pt-1 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#244C3A]">
            Stress Go
          </h1>
          <p className="text-xs text-[#827666]">
            A quiet place for your mind.
          </p>
        </div>

        {/* Teddy Bear Stress Relief Launcher */}
        <button
          onClick={() => onOpenStressTools('teddy_bop')}
          className="px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#8C5827] text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
          title="Bop the Stress Teddy"
        >
          <span className="text-base animate-bounce">🧸</span>
          <span>Teddy Bop</span>
        </button>
      </section>

      {/* 2. Interactive Cartoon Teddy Bear Stress Buster Card */}
      <section className="w-full">
        <TeddyStressBuster compact={true} />
      </section>

      {/* 3. Quick Stress Relief Pill Strip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#827666] uppercase tracking-wider">
            Quick Stress Relief
          </span>
          <button
            onClick={() => onNavigate('stress')}
            className="text-[11px] text-[#244C3A] font-medium hover:underline flex items-center gap-0.5"
          >
            <span>All tools</span>
            <ArrowRight size={11} />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onOpenStressTools('teddy_bop')}
            className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#8C5827] text-xs whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 font-semibold"
          >
            <span>🧸</span>
            <span>Teddy Bop</span>
          </button>
          <button
            onClick={() => onOpenStressTools('bilateral_tapping')}
            className="px-3 py-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] border border-[#91A88C]/30 text-[#27332C] text-xs whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Activity size={13} className="text-[#4A7C59]" />
            <span>Bilateral Tapping</span>
          </button>
          <button
            onClick={() => onOpenStressTools('circle_of_control')}
            className="px-3 py-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] border border-[#91A88C]/30 text-[#27332C] text-xs whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 font-medium"
          >
            <CheckCircle2 size={13} className="text-[#244C3A]" />
            <span>Circle of Control</span>
          </button>
          <button
            onClick={() => onOpenStressTools('brown_noise')}
            className="px-3 py-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] border border-[#91A88C]/30 text-[#27332C] text-xs whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Waves size={13} className="text-[#6B5B4D]" />
            <span>Brown Noise</span>
          </button>
          <button
            onClick={() => onOpenStressTools('perspective_101010')}
            className="px-3 py-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] border border-[#91A88C]/30 text-[#27332C] text-xs whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Clock size={13} className="text-[#3D5A80]" />
            <span>10/10/10 Perspective</span>
          </button>
          <button
            onClick={() => onOpenStressTools('sigh')}
            className="px-3 py-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] border border-[#91A88C]/30 text-[#27332C] text-xs whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Wind size={13} />
            <span>Physiological Sigh</span>
          </button>
          <button
            onClick={() => onOpenStressTools('box_breath')}
            className="px-3 py-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] border border-[#91A88C]/30 text-[#27332C] text-xs whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Square size={13} />
            <span>Box Breath</span>
          </button>
          <button
            onClick={() => onOpenStressTools('calming_stone')}
            className="px-3 py-1.5 rounded-full bg-[#EDE9DC] hover:bg-[#244C3A] hover:text-[#F7F5EE] border border-[#91A88C]/30 text-[#27332C] text-xs whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Fingerprint size={13} />
            <span>Touch Stone</span>
          </button>
        </div>
      </div>

      {/* 4. Daily Practice Hero Sanctuary Card */}
      <section className="relative rounded-3xl overflow-hidden border border-[#91A88C]/25 bg-[#244C3A] min-h-[210px] flex flex-col justify-between p-6 text-[#F7F5EE] shadow-sm">
        {/* Serene Glowing Breathing Aura Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-8 -top-8 w-56 h-56 rounded-full bg-[#91A88C]/20 blur-2xl animate-pulse" />
          <div className="absolute right-12 bottom-4 w-36 h-36 rounded-full border border-white/10" />
          <div className="absolute right-20 bottom-12 w-20 h-20 rounded-full border border-white/15" />
        </div>

        <div className="relative z-10 space-y-1">
          <span className="text-[10px] font-semibold text-[#91A88C] uppercase tracking-wider">
            Daily Practice
          </span>
          <h2 className="font-serif text-2xl font-normal leading-tight">
            3-Minute Breathing
          </h2>
          <p className="text-xs text-[#EDE9DC]/90 font-light max-w-xs">
            Follow the gentle rhythm to settle your nervous system.
          </p>
        </div>

        <div className="relative z-10 pt-4 flex items-center gap-2">
          <button
            onClick={() => onNavigate('meditate', 'three_minute_breath')}
            className="px-5 py-2.5 rounded-full bg-[#EDE9DC] text-[#244C3A] font-medium text-xs hover:bg-white transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <span>Begin Breathing</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => onNavigate('meditate', 'one_minute_pause')}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F5EE] border border-white/20 text-xs transition-colors backdrop-blur-sm"
          >
            1-Min Pause
          </button>
        </div>
      </section>

      {/* 5. Stress Relief Featured Tools Grid */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-[#244C3A]">
            Interactive Stress Management
          </h2>
          <button
            onClick={() => onNavigate('stress')}
            className="text-xs text-[#827666] hover:text-[#244C3A]"
          >
            View all tools
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Tool 1: Teddy Bear Stress Bop */}
          <button
            onClick={() => onOpenStressTools('teddy_bop')}
            className="p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 text-left transition-all flex flex-col justify-between min-h-[102px] group"
          >
            <div className="flex items-center justify-between text-[#8C5827]">
              <span className="text-[10px] font-mono">Tap & Bop</span>
              <span className="text-lg group-hover:scale-125 transition-transform">🧸</span>
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#8C5827]">
                Teddy Bear Bop
              </h3>
              <p className="text-[10px] text-[#8C5827]/80 mt-0.5">
                Hit to blow off steam
              </p>
            </div>
          </button>

          {/* Tool 2: Bilateral Tapping */}
          <button
            onClick={() => onOpenStressTools('bilateral_tapping')}
            className="p-3.5 rounded-2xl bg-[#EDE9DC]/60 hover:bg-[#EDE9DC] border border-[#91A88C]/30 text-left transition-all flex flex-col justify-between min-h-[102px] group"
          >
            <div className="flex items-center justify-between text-[#827666]">
              <span className="text-[10px] font-mono">1-3 min</span>
              <Activity size={16} className="text-[#4A7C59] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium text-[#244C3A]">
                Bilateral Tapping
              </h3>
              <p className="text-[10px] text-[#827666] mt-0.5">
                Butterfly hug pacer
              </p>
            </div>
          </button>

          {/* Tool 3: Circle of Control */}
          <button
            onClick={() => onOpenStressTools('circle_of_control')}
            className="p-3.5 rounded-2xl bg-[#EDE9DC]/60 hover:bg-[#EDE9DC] border border-[#91A88C]/30 text-left transition-all flex flex-col justify-between min-h-[102px] group"
          >
            <div className="flex items-center justify-between text-[#827666]">
              <span className="text-[10px] font-mono">Interactive</span>
              <CheckCircle2 size={16} className="text-[#244C3A] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium text-[#244C3A]">
                Circle of Control
              </h3>
              <p className="text-[10px] text-[#827666] mt-0.5">
                Sort & dissolve weights
              </p>
            </div>
          </button>

          {/* Tool 4: Brown Noise Generator */}
          <button
            onClick={() => onOpenStressTools('brown_noise')}
            className="p-3.5 rounded-2xl bg-[#EDE9DC]/60 hover:bg-[#EDE9DC] border border-[#91A88C]/30 text-left transition-all flex flex-col justify-between min-h-[102px] group"
          >
            <div className="flex items-center justify-between text-[#827666]">
              <span className="text-[10px] font-mono">Web Audio</span>
              <Waves size={16} className="text-[#6B5B4D] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-medium text-[#244C3A]">
                Brown Noise
              </h3>
              <p className="text-[10px] text-[#827666] mt-0.5">
                Deep low rumble
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* 6. Mood Check-in */}
      <section className="p-4 rounded-2xl bg-[#EDE9DC]/50 border border-[#91A88C]/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-medium text-[#244C3A]">
            How are you feeling right now?
          </h3>
          {selectedMood && (
            <button
              onClick={() => setSelectedMood(null)}
              className="text-[11px] text-[#827666] hover:text-[#244C3A]"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MOOD_RECOMMENDATIONS.map((item) => {
            const isSelected = selectedMood === item.mood;
            return (
              <button
                key={item.mood}
                onClick={() => setSelectedMood(item.mood)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#244C3A] text-[#F7F5EE]'
                    : 'bg-[#EDE9DC] text-[#27332C] hover:bg-[#91A88C]/30'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {currentMoodRecommendation && (
          <div className="mt-2 p-3 rounded-xl bg-white border border-[#91A88C]/30 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
            <div>
              <span className="font-medium text-[#244C3A]">
                {currentMoodRecommendation.suggestionTitle}
              </span>
              <p className="text-[#827666] text-[11px]">
                {currentMoodRecommendation.suggestionText}
              </p>
            </div>
            <button
              onClick={() => {
                if (currentMoodRecommendation.targetTab === 'stress') {
                  onOpenStressTools(currentMoodRecommendation.targetId as any);
                } else {
                  onNavigate(currentMoodRecommendation.targetTab, currentMoodRecommendation.targetId);
                }
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#244C3A] text-[#F7F5EE] text-xs font-medium hover:bg-[#193629] shrink-0"
            >
              Start
            </button>
          </div>
        )}
      </section>

      {/* 7. Recent Session Resume Card */}
      <div className="p-3.5 rounded-2xl bg-[#EDE9DC]/40 border border-[#91A88C]/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-semibold text-[#91A88C]">
            Recent Session
          </span>
          <h4 className="font-serif text-sm font-medium text-[#244C3A]">
            {lastSession ? lastSession.title : 'Teddy Bear Stress Bop'}
          </h4>
        </div>

        <button
          onClick={() => {
            if (lastSession?.type === 'stress') {
              onNavigate('stress');
            } else {
              onNavigate('meditate', 'three_minute_breath');
            }
          }}
          className="px-4 py-1.5 rounded-full border border-[#244C3A] text-[#244C3A] hover:bg-[#244C3A] hover:text-[#F7F5EE] text-xs font-medium transition-colors"
        >
          Resume
        </button>
      </div>
    </div>
  );
};
